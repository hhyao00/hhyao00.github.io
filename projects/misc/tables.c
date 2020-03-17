// ============================================================================ //
//                                                                              //
// Spring 2018                                                                  //
//                                                                              //
// One of the homeworks was to simulate virtual memory with an array            //
// and to simulate the retrieval and storage of "addresses" ie. converting      //
// from virtual address to the physical and storing, vice versa, etc.           //
//                                                                              //
// A lot of the students had trouble with this virtual vs physical memory       //
// storage/retrieval concept so I had wrote this small code chunk was to        //
// demonstrate the "program flow" and how things would be stored/represented.   //
//                                                                              //
// ============================================================================ //

#include <stdio.h>
#include <stdlib.h>

int *mem;


typedef struct p2 {
	int phys[256];
	int valid_bit[256];
} p2;


typedef struct p1 {
	// we can point to only one 2nd_level page
	// in reality, we have a hierarchy of tables,
	// but that's not needed for this homework.
	p2 *ptr[1];
} p1;


int main(){

	// your mem.c
	mem = malloc(1024);
	mem[0] = 72; // the 0, 4, 8 indexs here would be the 2nd 10 bits in VA.
	mem[4] = 66;
	mem[8] = 32;



	// your main.c
	p1 *table1 = malloc(sizeof(p1)); // page table 1
	
	p2 *table2 = malloc(sizeof(p2)); // page table 2


	// simulate letting the 2nd lvl tells us where to look in mem.
	table2->phys[0] = 0; // 0 comes from the VA: 0000000000 0000000000 000000000000
	table2->phys[1] = 4; // 1 comes from the VA: 0000000000 0000000001 000000000000
	table2->phys[2] = 8; // 2 comes from the VA: 0000000000 0000000010 000000000000

	/* 
	The 2nd 10 bits tell us where what INDEX [0],[1],etc. of the 2nd page table.
	At this index, the "physical index" is stored. The virtual address itself does
	does not contain the physical index. The physical index is stored in the 2nd 
	level page table, not the VA.  
	*/

	// access table 2, our only table. ptr[0] points to the base of the 2nd.
	table1->ptr[0] = table2;

	int mem_index = (table1->ptr[0])->phys[0]; 	// phys[0] stores some mem.c index
	int value_in_mem = mem[mem_index]; 			// "access mem.c" via fifo
	
	printf("%d\n", value_in_mem); // prints 72

}











