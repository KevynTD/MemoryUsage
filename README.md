# MemoryUsage

Profiling the memory used in the NodeJS process, measures the RAM used between the beginning and end of a measurement of some process.


# Working mode

Creates a file at the *root (by default, changeable)* and measures memory every *500ms (default, changeable)* logging into this file, when the measurement ends the result is logged on the console (values in MB) and the file is *deleted (default, changeable)*, then is useful for comparing the amount of memory used between different branches for the same processes.

The code is based on native [process.memoryUsage()](https://nodejs.org/api/process.html#processmemoryusage) in NodeJS.

An example result logged is as follows:
```js script
memoryUsage {
	min: {
		rss: 326.00064,
		heapTotal: 113.127424,
		heapUsed: 103.279096,
		external: 131.842603,
		arrayBuffers: 127.209412
	},
	max: {
		rss: 359.899136,
		heapTotal: 151.293952,
		heapUsed: 120.892752,
		external: 132.876472,
		arrayBuffers: 128.322873
	},
	avg: {
		rss: 349.888,
		heapTotal: 141.8267306666667,
		heapUsed: 113.26377733333334,
		external: 132.51202287499999,
		arrayBuffers: 127.95589595833336
	}
}
```

## Putting Start and End of Measurements

You manually define where the measurement starts and where it ends

```js script
import { memoryUsageInstance } from 'memoryUsage'

memoryUsageInstance.startLog({ archiveName: 'memoryUsage' })
// some process to have RAM measured
memoryUsageInstance.endLog()
```

## Placing an automatic measurement

This measurement starts the first time it is called, continues to run while it is called along time, and ends automatically *5000ms (by default, changeable)* after which the measured operation is no longer called.
It is good for use with ab test for multiple requests for example.

```js script
import { memoryUsageInstance } from 'memoryUsage'

// Starts a function that will be called several times
memoryUsageInstance.autoStartAndEnd({ archiveName: 'memoryUsage' })
// Ends this function
```

## Options

When starting an object is passed, it has by default the following options:
```js script
{
	fileLocation:  '', // default, root by default
	archiveName:  'memoryUsage', // default, name of measure, and temporary archive 
	msPerSamples:  500, // default, how many seconds are there between one sample and another
	msBeforeEnd:  5000, // default, (only used in autoStartAndEnd) amount of seconds considered without receiving calls to end measurement automatically
	onEndDelefeFile:  true // Whenever you finish a measurement and show it on the console, it erases the file with all the data used to generate the final result
}
```

## Original 'memoryUsage' and 'memoryUsageInstance'

You can use the ready-made instance to take measurements like above, or you can instantiate the main class yourself in different parts of the code, remembering that the measured memory will be the same at the time of data intersection, and the name needs to be changed so as not to overwrite the data of functions started in different places.

*SampleFile_1.js*
```js script
import { memoryUsage } from 'memoryUsage'

const MeasuringFunctionX_MB = new memoryUsage({ archiveName: 'FunctionX_MB' })

MeasuringFunctionX_MB.startLog()
// some process to have RAM measured
MeasuringFunctionX_MB.endLog()
```

*SampleFile_2.js*
```js script
import { memoryUsage } from 'memoryUsage'

const MeasuringFunctionY_MB = new memoryUsage({ archiveName: 'FunctionY_MB' })

// Starts a function that will be called several times
MeasuringFunction_MB.autoStartAndEnd()
// Ends this function
```
