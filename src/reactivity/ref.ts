import { ReactiveEffect, track, trigger } from "./effect";
import { reactive } from "./reactive";

export class RefImpl {
    private _value: any;
    public deps: Set<ReactiveEffect>[] = [];
    constructor(value) {
        this._value = value;
    }
    get value() {
        track(this, 'value'); // 收集依赖
        return this._value;
    }

    set value(newValue) {
        if (newValue !== this._value) {
            this._value = newValue;
            trigger(this, 'value'); // 触发更新
        }
    }
}



export function ref(value) {
    return new RefImpl(value);
}