import { isObject } from "../shared";
import { ReactiveEffect, track, trigger } from "./effect";
import { reactive } from "./reactive";

export class RefImpl {
    private _value: any;
    public __v_isRef = true;
    constructor(value) {
        this._value = value;
    }
    get value() {
        track(this, 'value'); // 收集依赖
        return convert(this._value);
    }

    set value(newValue) {
        if (newValue !== this._value) {
            this._value = newValue;
            trigger(this, 'value'); // 触发更新
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
    return new RefImpl(value);
}

export function isRef(value) {
    return value instanceof RefImpl;
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver);
            return unRef(value);
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            if (isRef(oldValue) && !isRef(value)) {
                oldValue.value = value;
                return true;
            } else {
                return Reflect.set(target, key, value, receiver);
            }
        }
    });
}
