function ff(x: boolean): true;
function ff(x: string): string;

// Implementation signature, not publicly visible
function ff(x: boolean | string): boolean | string {
    return typeof x === 'boolean' ? true : 'str'
}

ff('false')

export default ff