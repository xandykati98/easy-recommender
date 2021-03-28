import mean from "@math/mean";
import sum from "@math/sum";
import { Vector1D } from 'math-types';

export function simple_std_deviation(vec: Vector1D) {
    const n_mean = mean(vec);
    return Math.sqrt( sum(vec.map(n => Math.abs( n - n_mean) ** 2)) / vec.length)
}

/**
 * Welford's algorithm
 * @todo (uds) Understang EXACTLY how this works
 * @see https://stackoverflow.com/questions/1174984/how-to-efficiently-calculate-a-running-standard-deviation
 */
export class welford_std_deviation {
    size:number
    old_mean:number
    new_mean:number
    old_sqrd_sum:number
    new_sqrd_sum:number
    constructor(vec: Vector1D) {
        this.size = 0
        this.old_mean = 0
        this.new_mean = 0
        this.old_sqrd_sum = 0
        this.new_sqrd_sum = 0
        for (const number of vec) {
            this.push(number)
        }
    }
    clear() {
        this.size = 0
    }
    push(value:number) {
        this.size++

        if (this.size === 1) {
            this.old_mean = this.new_mean = value;
            this.old_sqrd_sum = 0;
        } else {
            this.new_mean = this.old_mean + (value - this.old_mean) / this.size
            this.new_sqrd_sum = this.old_sqrd_sum + (value - this.old_mean) * (value - this.new_mean)

            this.old_mean = this.new_mean
            this.old_sqrd_sum = this.new_sqrd_sum
        }
    }
    mean() {
        if (this.size) {
            return this.new_mean
        } else return 0.0
    }
    variance() {
        if (this.size > 1) {
            return this.new_sqrd_sum / this.size // compute for population size
        } else return 0.0
    }
    std_deviation() {
        return Math.sqrt(this.variance())
    }
}