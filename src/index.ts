/**
 * PROBLEM: For big sets of data that need the most precision possible it is very costly
 * to compute the variance, sum, mean of each column in every new data point.
 * This is due to the need of a loop through the whole column and doing this computation for every data point (old and new):
 * u = Column mean/avarage
 * s = Column std variation OR sqrt of the column variance
 * (item - u) / s
 * but before this computation can be done another loop through the whole column needs to be done. One that computes the
 * mean, sum and variance of the column with precision.
 * 
 * So, we pass this heavy work to the worker threads! 
 * Great! But with this a new problem arrives,
 * copying lots and lots of data to the worker can real slow so we need to use SharedArrayBuffers. 
 * Great! But with this a new problem arrives,
 * typed arrays have a fixed length, and it is IMPOSSIBLE to extend it, we have to create another typed array with a bigger size
 * if we need to. But this is not the real problem, the real problem is that we only have to computate the things above in of the items that we really need
 * so we need to pass the row item count of the columns so we know when to stop computing. This is rather easy, just pass the limit and when it comes we
 * just break the loop.
 * 
 * Ok, this solution might work just fine. 
 * Great! But with this a new problem arrives,
 * the vectors we use today (NamedVector2D) are not typedarrays
 * so we have a few options:
 * - In the NamedVector2D we can create a SharedArrayBuffer for each column and keep it up to date by in the end of each "setNextIndex"
 * changing the value of all the typed arrays in the NamedVector2D, and then telling the worker to compute the scaled counterpart.
 */
export default {};