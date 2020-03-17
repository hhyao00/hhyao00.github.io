###################################################################################
# AdaBoost and Decision Stump algorithms as psuedo-implmented                     #
# in 'Understanding Machine Learning' by Shai Shalev-Shwartz.                     #
#                                                                                 #
# usage: python adaboost.py -f <file-name> -m <erm or cv> [-T <boosting rounds>]  # 
###################################################################################

import numpy as np

class Decision_Stump():

    def fit(self, X, y, D):
        """
        X: a (m,d) dimen array of data items
        y: labels for each of the i...m X items
        D: distribution vector for i...m X items
        Find and return best split feature j,
        and best split value theta on j
        """
        F_opt = np.inf
        theta_opt, j_opt = None, None
        m, d = X.shape

        # loop through all the dimensions
        X = np.column_stack((X, y, D))
        for j in range(d):

            # sort by jth dimension
            X1 = X[np.argsort(X[:, j])].copy()
            y1 = X1[:, -2]
            D1 = X1[:, -1]
            X1 = X1[:, j]
            X1 = np.append(X1, X1[-1]+1)

            # initialize predictions
            F = np.sum(D1[y1 == 1])
            if F < F_opt:
                F_opt, j_opt = F, j
                theta_opt = X1[0]-1

            # loop through i=0...m, look for ideal split
            for i in range(m-1):
                F = F - y1[i]*D1[i]
                if F < F_opt and X1[i] != X1[i+1]:
                    F_opt = F
                    j_opt = j
                    theta_opt = 0.5*(X1[i]+X1[i+1])

        self.theta = theta_opt
        self.j = j_opt
        return theta_opt, j_opt

    def predict(self, X, d):

        # everything >= theta is to be 1-,
        # everything less than theta is 1.
        # prediction is based on the jth column.

        y_pred = X[:, self.j].copy()
        for i in range(len(X)):
            if y_pred[i] < self.theta:
                y_pred[i] = 1
            elif y_pred[i] >= self.theta:
                y_pred[i] = -1
        return y_pred

    def error(self, y_pred, y_true, d):
        e = 0
        for i in range(len(d)):
            if (y_pred[i] != y_true[i]):
                e += d[i]*1
        return e


class AdaBoost():

    def __init__(self, T=10):
        self.T = T

    def fit(self, X, y):

        m = len(X)
        D = np.array(np.ones(m))/m
        weights, thetas, js = [], [], []

        for t in range(self.T):
            D = np.vstack([D, np.zeros((1, m))])

            ds = Decision_Stump()
            theta, j = ds.fit(X, y, D[t])
            y_pred = ds.predict(X, D[t])
            err = ds.error(y_pred, y, D[t])
            w_t = 0.5*np.log(1/err - 1)

            weights.append(w_t)
            thetas.append(theta)
            js.append(j)

            Z = 0 # distribution normalization factor
            for i in range(len(X)):
                D[t+1] = D[t]*np.exp(-1*w_t*y[i]*y_pred[i])
                Z += D[t]*np.exp(-1*w_t*y[i]*y_pred[i])
            D[t+1] = D[t+1]/Z

        self.weights = weights
        self.thetas = thetas
        self.js = js

    def predict(self, X):
        """        
        for each item 1...m, go through the distribution
        matrix and take into account the result from each
        universe that it had lived through.
        """
        predictions = []
        for i in range(len(X)):
            yi_pred = []
            for t in range(self.T):

                # predict for ith item based on theta
                p = 0
                if (X[i, self.js[t]] >= self.thetas[t]):
                    p = -1
                if (X[i, self.js[t]] < self.thetas[t]):
                    p = 1

                # incoporate the weight of this prediction
                yi_pred.append(p*self.weights[t])

            # take the sign
            p1 = np.sum(yi_pred)
            if p1 > 0: predictions.append(1)
            else: predictions.append(-1)
        return predictions

    def error(self, y_pred, y_true):
        return 1 - len(y_pred[y_pred == y_true])/len(y_pred)

"""------------------------------------------------------------"""

def cv_data(data, m, m_folds):
    """
    For a given dataset, and m-fold, split the data such
    that the mth index (subset) is the test dataset,and
    keep the remaining for training. Returns xtrain, xtest.
    """
    def merge_lists(l):
        """ l is a list of lists """
        ret = []
        [ret.extend(l[i]) for i in range(len(l))]
        return ret

    splits = np.array_split(data, m_folds)
    splits = np.asarray(splits).tolist()
    xtest = splits.pop(m)
    xtrain = merge_lists(splits)
    return np.array(xtrain), np.array(xtest)

def ERM(file, T):
    """
    file assumes the last column to be the label vector.
    """
    X = np.genfromtxt(file,delimiter=',',skip_header=True)
    X[:,-1][X[:,-1] > 0] = 1
    X[:,-1][X[:,-1] <= 0] = -1
    y = X[:,-1]
    X = X[:,:-1]

    ab = AdaBoost(T)
    ab.fit(X=X,y=y)
    y_pred = np.array(ab.predict(X))
    err = ab.error(y_pred, y)

    print('-'*15)
    print('AdaBoost ERM, T:',ab.T)
    print('prediction error:',err)
    print('weight vector:',ab.weights)
    print('-'*15)

def CV(file, T):
    """
    file assumes the last column to be the label vector.
    """
    X = np.genfromtxt(file,delimiter=',',skip_header=True)
    X[:,-1][X[:,-1] > 0] = 1
    X[:,-1][X[:,-1] <= 0] = -1
    y = X[:,-1]
    X = X[:,:-1]

    print('-'*15)
    for t in (range(T)):
        print('\nT', t)
        means = []
        k = 10
        for i in range(k):
            x_train, x_test = cv_data(X,i,k)
            y_train, y_test = cv_data(y,i,k)

            ab = AdaBoost(t)
            ab.fit(X=x_train,y=y_train)
            y_pred = np.array(ab.predict(x_test))
            err = ab.error(y_pred, y_test)
            print('.fold',i,'\n error:',err)
            print(' weight',ab.weights)

            means.append(err)
        
        print('\nAdaBoost with T=5:',file)
        print('average prediction error:',np.mean(means))
        print('-'*15)

"""------------------------------------------------------------"""

import sys, getopt

def main(argv):
    try:
        opts, args = getopt.getopt(argv,"f:m:T:",["file=","mode="])
    except getopt.GetoptError:
        sys.exit(2)

    if len(opts) < 2:
        print("\nREQUIRED")
        print("  -f , --file <file_path>")
        print("  -m , --mode <erm or cv>")
        print("  [-T  <boost rounds> (default=5)]\n")
        sys.exit(2)

    file = ''
    mode = ''
    T = 5
    for opt, arg in opts:
        if opt in ("-f","--file"):
            file = arg
        elif opt in ("-m","--mode"):
            mode = arg
        elif opt in ("-T"):
            T = arg
        else:
            print("\nREQUIRED")
            print("  -f , --file <file_path>")
            print("  -m , --mode <erm or cv>")
            print("  [-T  <boost rounds> (default=5)]\n")

    if mode == 'erm':
        ERM(file,int(T))
    elif mode == 'cv':
        CV(file, int(T))


if __name__ == "__main__":
    main(sys.argv[1:])