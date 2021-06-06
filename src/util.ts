export class CallbackArray extends Array {
    add(callback:Function) {
        return this.push(callback)
    }
    remove(callback:Function) {
        const indexToRemove = this.findIndex(item => item !== callback)
        if (indexToRemove > -1) {
            this.splice(indexToRemove, 1)
        }
        return indexToRemove
    }
    removeAll() {
        this.splice(0, this.length)
    }
}

// Ref.: https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
// slightly changed to server a input as (arr, arr2)
export function zip(...rows: any[]) {
    return [rows][0].map((_,c) => rows.map(row=>row[c]))
}