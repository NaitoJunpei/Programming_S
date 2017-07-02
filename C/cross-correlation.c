#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>
#define SPIKE_LENGTH 1000000

int Poisson(double* spikes, double hz) {
  int counter, index;
  index = 0;
  for(counter = 0; counter < SPIKE_LENGTH; counter++) {
    if (hz / 1000.0 > rand() / (double)RAND_MAX) {
      spikes[index] = counter / 1000.0;
      index += 1;
    }
  }
  return index;
}

double average(int* array, int size) {
  int counter;
  double anser = 0.0;
  for(counter = 0; counter < size; counter++) {
    anser += array[counter];
  }
  anser /= size;
  return anser;
}

double deviation(int* array, int size, double mean) {
  int counter;
  double anser = 0.0;
  for(counter = 0; counter < size; counter++) {
    anser += array[counter] * array[counter];
  }
  anser /= size;
  anser -= mean * mean;

  return sqrt(anser);
}

int checker(double mean, double dev, int height) {
  return(height >= mean + dev * 2.6);
}
  


int main() {
  int i;
  int anser = 0;
  srand(time(NULL));
  for(i = 0; i < 1000; i++) {
    double* spikeA = malloc(sizeof(double) * SPIKE_LENGTH);
    int sizeA;
    double* spikeB = malloc(sizeof(double) * SPIKE_LENGTH);
    int sizeB;
    int indexA, indexB;
    int restB;
    double* mini;
    int hist[20] = {0};

    double mean, dev;
    int flag;

    fprintf(stdout, "%04d\t", i);

    if (spikeA == NULL || spikeB == NULL) {
      fprintf(stderr, "Error: Memory could not be secured");
    }

    mini = spikeB;
      
    //srand(time(NULL));
    sizeA = Poisson(spikeA, 1.0);
    sizeB = Poisson(spikeB, 1.0);
    restB = sizeB;

    for(indexA = 0; indexA < sizeA; indexA++) {
      double tA = spikeA[indexA];
      indexB = 0;
      for(indexB = 0; indexB < restB;) {
	if(mini[indexB] + 0.1 < tA) { /* mini[index] < spikeA[counter] - 10ms */
	  mini++;
	  restB -= 1;
	} else {
	  if(mini[indexB] -tA > 0.1) {
	    break;
	  }
	  double diff;
	  diff = mini[indexB] - tA;
	  hist[(int)floor(diff * 100.0) + 10] += 1;
	  indexB += 1;
	}
      }
    }

    mean = average(hist, 20);
    dev = deviation(hist, 20, mean);
    flag = checker(mean, dev, hist[10]);
  
    //fprintf(stdout, "mean\t:%f\ndeviation\t:%f\nheight\t:%d\n", mean, dev, hist[10]);
    if(flag) {
      fprintf(stdout, "True\n");
      anser += 1;
    } else {
      fprintf(stdout, "False\n");
    }
  
    free(spikeA);
    free(spikeB);
  }
  fprintf(stdout, "Last\t:%d\n", anser);
  return 0;
}
