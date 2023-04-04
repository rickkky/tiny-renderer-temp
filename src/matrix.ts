import { Vector } from './vector';

export abstract class Matrix<T extends Vector> {
    protected array: T[] = [];

    constructor(...args: T[] | number[][]) {
        if (args.length < 2) {
            throw new Error('Matrix must have at least 2 dimensions');
        }
    }

    get dimension() {
        return this.array.length;
    }

    get 0() {
        return this.array[0];
    }

    set 0(v: T) {
        this.array[0] = v;
    }

    get 1() {
        return this.array[1];
    }

    set 1(v: T) {
        this.array[1] = v;
    }
}
