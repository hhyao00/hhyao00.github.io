###################################################################
# Perceptron algorithm (linear seperability) as psuedo-implmented #
# in 'Understanding Machine Learning' by Shai Shalev-Shwartz.     #
#                                                                 #
# usage: python perceptron.py -f <file-name> -m <erm or cv>       # 
###################################################################

import numpy as np 

class Perceptron():

    def __init__(self, T=500, alpha=1):
        """
        T is the number of iterations,
        alpha is the learning rate.
        """
        self.T = T
        self.alpha = alpha
        
    def fit(self,X, y):
        """ Find set of weights, if possible """
        weights = np.array(np.zeros((1,len(X.T)+1)))
        errors = []
        t = 0
        while(True):
            # preparnig for another round
            weights = np.vstack([weights, np.zeros((1,len(X.T)+1))])
            w = weights[t]
            correct = 0
            
            # for each data item in X
            for i in range(len(X)):
                y_pred = np.dot(X[i],w[1:])+w[0]
                if (y_pred*y[i] <= 0):
                    # wrong prediction, update weights
                    weights[t+1][1:] = w[1:] + self.alpha*y[i]*X[i]
                    weights[t+1][0] = w[0] + self.alpha*y[i]
                else:
                    correct += 1
            t += 1
            acc = correct/len(X)
            errors.append((1-acc))
            
            if (correct == len(X)):
                # update and return
                self.weights = weights[-2]
                self.train_acc = correct/len(X)
                return 1-self.train_acc, self.weights
            
            elif (t > self.T): 
                # check the error vector, for convergence since this 
                # dataset is probably not linearly separable.
                if (np.abs(np.mean(errors[:-20])-errors[-1]) < 0.0001
                    or t > 10000):
                    # return the best seen, since we can't converge
                    min_err = min(errors)
                    idx = errors.index(min_err)
                    self.train_acc = 1 - min_err
                    self.weights = weights[idx]
                    return 1-self.train_acc, self.weights
                              
    def predict(self, X):
        """ 
        Given X, output the label(s) for X.
        Input X must be a 2d array: [[ ]]
        """
        res = []
        weights = self.weights
        for i in range(len(X)):
            v = np.dot(X[i],weights[1:])+weights[0]
            if v >= 0: res.append(1)
            else: res.append(-1)
        return np.array(res)
    
    def error(self, y_pred, y_true):
        return len(y_pred[y_pred!=y_true])/len(y_pred)

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

def ERM(file):
    X = np.genfromtxt(file,delimiter=',',skip_header=True)
    X[:,-1][X[:,-1] > 0] = 1
    X[:,-1][X[:,-1] <= 0] = -1
    y = X[:,-1]
    X = X[:,:-1]

    p = Perceptron()
    err, weights = p.fit(X,y)

    print('-'*15)
    print('Perceptron')
    print('prediction error:',err)
    print('weight vector:',weights)
    print('-'*15)

def CV(file):
    """
    file assumes the last column to be the label vector.
    """
    X = np.genfromtxt(file,delimiter=',',skip_header=True)
    X[:,-1][X[:,-1] > 0] = 1
    X[:,-1][X[:,-1] <= 0] = -1
    y = X[:,-1]
    X = X[:,:-1]

    print('-'*15)
    means = []
    m = 10
    for i in range(m):
        x_train, x_test = cv_data(X,i,m)
        y_train, y_test = cv_data(y,i,m)
        
        p = Perceptron()
        err, weights = p.fit(X=x_train,y=y_train)
        y_pred = p.predict(x_test)
        err = p.error(y_pred,y_test)
        means.append(err)
        
        print('.fold',i,'\n error:',err)
        print(' weight',weights)
    
    print('\nPerceptron')
    print('average prediction error:',np.mean(means))
    print('-'*15)


"""------------------------------------------------------------"""

import sys, getopt

def main(argv):
    try:
        opts, args = getopt.getopt(argv,"f:m:",["file=","mode="])
    except getopt.GetoptError:
        sys.exit(2)

    if len(opts) < 2:
        print("\nREQUIRED")
        print("  -f , --file <file_path>")
        print("  -m , --mode <erm or cv>\n")
        sys.exit(2)

    file = ''
    mode = ''
    for opt, arg in opts:
        if opt in ("-f","--file"):
            file = arg
        elif opt in ("-m","--mode"):
            mode = arg
        else:
            print("\nREQUIRED")
            print("  -f , --file <file_path>")
            print("  -m , --mode <erm or cv>\n")

    if mode == 'erm':
        ERM(file)
    elif mode == 'cv':
        CV(file)


if __name__ == "__main__":
    main(sys.argv[1:])