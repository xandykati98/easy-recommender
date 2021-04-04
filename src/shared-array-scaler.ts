import { Worker } from 'worker_threads';

type SharedArrayScalerOptions = {
    byte_multiplier?: 20 | number,
    byte_length?: number,
}

export default class SharedArrayScaler {
    length: number
    worker: Worker
    typedarray: Float32Array
    unscaled_typedarray: Float32Array
    buffer_size: number
    private worker_filename: string
    private wait_resolver?: Function
    busy: boolean
    constructor(options?:SharedArrayScalerOptions) {
        this.busy = false
        this.buffer_size = options?.byte_length || (1024 * (options?.byte_multiplier || 20))
        this.length = 0
        const sab = new SharedArrayBuffer(this.buffer_size)
        this.typedarray = new Float32Array(sab)

        const unscaled_sab = new SharedArrayBuffer(this.buffer_size)
        this.unscaled_typedarray = new Float32Array(unscaled_sab)
        this.worker_filename = __filename.replace('shared-array-scaler.ts', 'w-shared-array-scaler.js')
        this.worker = new Worker(this.worker_filename, {
            workerData: {
                typedarray: this.typedarray,
                unscaled_typedarray: this.unscaled_typedarray
            }
        });
        this.worker.addListener('message', this.unbusy)
    }
    private unbusy() {
        this.busy = false
        if (this.wait_resolver) this.wait_resolver()
    }
    terminateWorker() {
        return this.worker.terminate()
    }
    waitLastCalc() {
        return new Promise((resolve, _) => {
            if (this.busy) {
                const resolver = () => {
                    resolve(true)
                    this.busy = false
                }
                this.wait_resolver = resolver;
                this.worker.addListener('message', resolver)
            } else resolve(true)
        })
    }
    private setWorker() {
        this.worker = new Worker(this.worker_filename, {
            workerData: {
                typedarray: this.typedarray,
                unscaled_typedarray: this.unscaled_typedarray
            }
        });
        this.worker.addListener('message', this.unbusy)
    }
    informData(value:number, index:number) {
        if (index >= this.length) {
            this.length = index + 1
        }
        this.busy = true
        this.typedarray[index] = value;
        this.unscaled_typedarray[index] = value;
        
        this.terminateWorker()
        this.setWorker()

        this.worker.postMessage({ length: this.length })
    }
    get as_array() {
        const fake_array = []
        let i = 0
        for (const value of this.typedarray) {
            if (i === this.length) break;
            fake_array.push(value)
            i++;
        }
        return fake_array
    }
    get unscaled_as_array() {
        const fake_array = []
        let i = 0
        for (const value of this.unscaled_typedarray) {
            if (i === this.length) break;
            fake_array.push(value)
            i++;
        }
        return fake_array
    }
}