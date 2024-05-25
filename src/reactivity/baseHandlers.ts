import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";
import { warn } from "./warning";

export class BaseHandlers implements ProxyHandler<object> {
    get(target: object, key: string | symbol, receiver: object) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        if (key === ReactiveFlags.IS_READONLY) {
            return true;
        }
        const result = Reflect.get(target, key, receiver);
        track(target, key);
        return isObject(result) ? reactive(result) : result;
    }

    set(target: object, key: string | symbol, value: any, receiver: object) {
        const oldValue = target[key];
        const result = Reflect.set(target, key, value, receiver);
        if (oldValue !== value && (oldValue === oldValue || value === value)) {
            trigger(target, key);
        }
        return result;
    }

    has(target: object, key: string | symbol) {
        const result = Reflect.has(target, key);
        track(target, key);
        return result;
    }

    ownKeys(target: object) {
        track(target, 'iterate');
        return Reflect.ownKeys(target);
    }

    deleteProperty(target: object, key: string | symbol) {
        const result = Reflect.deleteProperty(target, key);
        if (result) {
            trigger(target, key);
        }
        return result;
    }
}

export class MutableHandlers extends BaseHandlers {
    // Inherits everything from BaseHandlers
}

export class ReadonlyHandlers extends BaseHandlers {
    get(target: object, key: string | symbol, receiver: object) {
        if (key === ReactiveFlags.IS_READONLY) {
            return true;
        }
        const result = Reflect.get(target, key, receiver);
        return isObject(result) ? readonly(result) : result;
    }

    set(target: object, key: string | symbol, value: any, receiver: object) {
        warn(`key: ${String(key)} set failed, target is readonly`);
        return true;
    }

    deleteProperty(target: object, key: string | symbol) {
        warn(`delete property ${String(key)} failed, target is readonly`);
        return true;
    }
}

export const baseHandlers = new BaseHandlers();
export const readonlyHandlers = new ReadonlyHandlers();
export const mutableHandlers = new MutableHandlers();
