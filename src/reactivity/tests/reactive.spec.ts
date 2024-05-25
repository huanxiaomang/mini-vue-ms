import { describe, it, expect, test } from "vitest";
import { isReactive, reactive } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 };
        const observed = reactive(original);
        expect(observed).not.toBe(original);
        expect(observed.foo).toBe(1);
        expect(isReactive(observed)).toBe(true);
        expect(isReactive(original)).toBe(false);
    });

    test('nested reactives', () => {
        const original = {
            nested: {
                foo: 1,
            },
            array: [{ bar: 2 }],
        };
        const observed = reactive(original);
        expect(isReactive(observed.nested)).toBe(true);
        expect(isReactive(observed.array)).toBe(true);
        expect(isReactive(observed.array[0])).toBe(true);
    });

    test('reactive arrays', () => {
        const original = [1, { foo: 2 }];
        const observed = reactive(original);
        expect(isReactive(observed)).toBe(true);
        expect(isReactive(observed[1])).toBe(true);
        expect(observed[0]).toBe(1);
        expect(observed[1].foo).toBe(2);

        // Modifying array elements
        observed[0] = 10;
        expect(observed[0]).toBe(10);

        // Adding elements to the array
        observed.push({ bar: 3 });
        expect(observed.length).toBe(3);
        expect(isReactive(observed[2])).toBe(true);
        expect(observed[2].bar).toBe(3);

        // Removing elements from the array
        const popped = observed.pop();
        expect(popped.bar).toBe(3);
        expect(observed.length).toBe(2);
    });

    test('reactive array methods', () => {
        const original = [];
        const observed = reactive(original);

        // Test push method
        observed.push(1);
        expect(observed.length).toBe(1);
        expect(observed[0]).toBe(1);

        // Test pop method
        const poppedValue = observed.pop();
        expect(poppedValue).toBe(1);
        expect(observed.length).toBe(0);

        // Test unshift method
        observed.unshift(2);
        expect(observed.length).toBe(1);
        expect(observed[0]).toBe(2);

        // Test shift method
        const shiftedValue = observed.shift();
        expect(shiftedValue).toBe(2);
        expect(observed.length).toBe(0);

        // Test splice method
        observed.push(1, 2, 3);
        observed.splice(1, 1, 4);
        expect(observed.length).toBe(3);
        expect(observed).toEqual([1, 4, 3]);

        // Test sort method
        observed.sort((a, b) => b - a);
        expect(observed).toEqual([4, 3, 1]);

        // Test reverse method
        observed.reverse();
        expect(observed).toEqual([1, 3, 4]);
    });
});
