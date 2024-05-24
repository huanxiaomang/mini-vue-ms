import { isObject } from "../shared";
import { baseHandlers, mutableHandlers, readonlyHandlers } from "./baseHandlers";
import { warn } from "./warning";

export function reactive(target: object) {
    return createReactiveObject(target, baseHandlers);
}

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadOnly'
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}

export function readonly(target: object) {
    return createReactiveObject(target, readonlyHandlers, false, true);
}

function createReactiveObject<T extends {}>(raw: T, baseHandlers: ProxyHandler<T>, isShallow = false, isReadonly = false) {
    if (!isObject(raw)) {
        console.warn(raw + '必须是一个对象');
        return raw;
    }
    return isReadonly ?
        new Proxy(raw, readonlyHandlers) :
        new Proxy(raw, mutableHandlers);
}