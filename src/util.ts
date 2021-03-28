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