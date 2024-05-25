import { EffectRunner, effect } from "./effect";

class ComputedRefImpl<T> {
    private runner: EffectRunner;
    private _value: T | undefined;
    private _dirty: boolean;

    constructor(getter: () => T) {
        this._dirty = true;
        this.runner = effect(getter, {
            lazy: true,
            scheduler: () => {
                if (!this._dirty) {
                    this._dirty = true;
                }
            }
        });
    }

    get value(): T {
        if (this._dirty) {
            this._value = this.runner();
            this._dirty = false;
        }
        return this._value!;
    }
}

export function computed<T>(getter: () => T) {
    return new ComputedRefImpl(getter);
}
