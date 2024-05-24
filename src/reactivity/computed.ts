import { EffectRunner, effect } from "./effect";

class ComputedRefImpl<T> {
    private runner: EffectRunner;
    private _value: any;
    private _dirty: boolean = true;
    constructor(getter: () => T) {
        this.runner = effect(getter, {
            lazy: true,
            scheduler: () => {
                this._dirty = true;
            }
        });


    }
    get value() {
        if (this._dirty) {
            this._dirty = false;
            this._value = this.runner();
        }
        return this._value;
    }
}

export function computed(getter: () => any) {
    return new ComputedRefImpl(getter);
}