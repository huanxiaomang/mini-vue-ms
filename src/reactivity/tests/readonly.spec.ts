import { describe, it, expect, vitest } from "vitest";
import { isProxy, isReactive, isReadonly, readonly } from "../reactive";

describe('readonly', () => {
    it("should make nested values readonly", () => {
        const original = { foo: 1, bar: { baz: 2 } };
        const wrapped = readonly(original);
        expect(wrapped).not.toBe(original);
        // get
        expect(wrapped.foo).toBe(1);
        expect(isReactive(wrapped)).toBe(false);
        expect(isReadonly(wrapped)).toBe(true);
        expect(isReactive(original)).toBe(false);
        expect(isReadonly(original)).toBe(false);
        expect(isReactive(wrapped.bar)).toBe(false);
        expect(isReadonly(wrapped.bar)).toBe(true);
        expect(isReactive(original.bar)).toBe(false);
        expect(isReadonly(original.bar)).toBe(false);
        expect(isProxy(wrapped)).toBe(true);

    });

    it('warn then call set', () => {
        console.warn = vitest.fn();
        const user = readonly({ age: 10 });
        user.age = 12;
        expect(console.warn).toBeCalled();
        expect(user.age).toBe(10);


    })
})