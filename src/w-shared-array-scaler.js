// @ts-check
const { parentPort, workerData } = require('worker_threads');

const typedarray = workerData.typedarray
const unscaled_typedarray = workerData.unscaled_typedarray

const sum = (arr) => {
    let result = 0;
    for (const number of arr) {
        result+=number
    }
    return result
}

parentPort.addListener('message', (data) => {
    const { length } = data;
    
    let array_sum = 0;

    let i = 0
    for (const value of unscaled_typedarray) {
        if (i === length) break;
        array_sum+=value
        i++;
    }

    const u = array_sum / length;

    i = 0;
    let std_dev_inside = []
    for (const value of unscaled_typedarray) { // maybe iterate starting by the last to use cache locality? idk, just a thougt
        if (i === length) break;
        const up_variance = Math.abs(value - u) ** 2
        std_dev_inside.push(up_variance)
        i++;
    }
    
    const variance = sum(std_dev_inside) / length
    const s = Math.sqrt(variance)
    
    i = 0;
    for (const value of unscaled_typedarray) {
        if (i === length) break;
        typedarray[i] = (value - u) / (s||1)

        i++;
    }

    parentPort.postMessage({ length })
});

// https://stackoverflow.com/questions/3177774/how-to-prevent-html5-web-workers-from-locking-up-thus-correctly-responding-to-me
// https://stackoverflow.com/questions/32268936/posting-a-message-to-a-web-worker-while-it-is-still-running