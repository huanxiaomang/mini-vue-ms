import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

export class BaseHandlers implements ProxyHandler<object> {
    get(target: object, key: string | symbol, receiver: object) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        const result = Reflect.get(target, key, receiver);
        track(target, key);
        return isObject(result) ? reactive(result) : result;
    }

    set(target: object, key: string | symbol, value: any, receiver: object) {
        const oldValue = target[key];
        const newValue = value;

        const result = Reflect.set(target, key, value, receiver);
        // 确保不能全是NaN
        if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
            trigger(target, key);
        }
        return result;
    }
}

export class MutableHandlers extends BaseHandlers { }

export class ReadonlyHandlers extends BaseHandlers {
    get(target: object, key: string | symbol, receiver: object) {
        if (key === ReactiveFlags.IS_READONLY) {
            return true;
        }
        const result = Reflect.get(target, key, receiver);
        track(target, key);
        return isObject(result) ? readonly(result) : result;
    }
    set(target: object, key: string | symbol, value: any, receiver: object) {
        console.warn(`key: ${String(key)} set failed, target is readonly`);
        return true;
    }
}

export const baseHandlers = new BaseHandlers();
export const readonlyHandlers = new ReadonlyHandlers();
export const mutableHandlers = new MutableHandlers();