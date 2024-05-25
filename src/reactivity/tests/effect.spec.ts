import { describe, expect, it, vitest } from "vitest";
import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        });

        let nextAge;
        effect(() => {

            nextAge = user.age + 1;
        })
        expect(nextAge).toBe(11);

        // update
        user.age++;

        expect(nextAge).toBe(12);
    })

    it('should return runner when call effect', () => {
        let foo = 10;
        const runner = effect(() => {
            foo++;
            return "foo";
        })

        expect(foo).toBe(11);
        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe("foo");

    })

    it('nest effect', () => {
        const user = reactive({
            age: 10,
            name: 'sb'
        });

        let temp1, temp2;
        const res: number[] = [];
        effect(() => {

            effect(() => {
                temp1 = user.age;
                res.push(1);
            })
            temp2 = user.name;
            res.push(2);
        })

        user.name = 'sb2';

        expect(res[0]).equal(1);
        expect(res[1]).equal(2);
        expect(res[2]).equal(1);
        expect(res[3]).equal(2);

    })

    it('prevent infinite recursive loops', () => {
        const data = { foo: 1 };

        const obj = reactive(data);

        expect(() => effect(() => obj.foo++)).not.toThrow();

    })
    it('scheduler', () => {
        let dummy
        let run: any
        const scheduler = vitest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler },
        )
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        // should be called on first trigger
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)
        // manually run
        run()
        // should have run
        expect(dummy).toBe(2)

        // const jobQueue = new Set();
        // const p = Promise.resolve();

        // let isFlushing = false;

        // function flushJob() {
        //     if (isFlushing) return;
        //     isFlushing = true;

        //     p.then(() => {
        //         jobQueue.forEach((job: any) => job());
        //     }).finally(() => {
        //         isFlushing = false;
        //     })
        // }

        // effect(() => {
        //     console.log(obj.foo);

        // }, {
        //     scheduler(fn) {
        //         console.log(fn);

        //         jobQueue.add(fn);
        //         flushJob();
        //     }
        // })
        // obj.foo++;
        // obj.foo++;
        // obj.foo++;
    })
    it('stop', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
            dummy = obj.prop
        })
        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runner)
        obj.prop++;
        expect(dummy).toBe(2)

        // stopped effect should still be manually callable
        runner()
        expect(dummy).toBe(3)
    })
    it('option: lazy', () => {
        const obj = reactive({ prop: 1 })
        let times = 0;
        const runner = effect(() => {
            times++;
            return obj.prop + 1;
        }, { lazy: true });
        expect(times).toBe(0);
        expect(runner()).toBe(2);
        expect(times).toBe(1);
        obj.prop++;
        expect(runner()).toBe(3);
        expect(times).toBe(3);
    })
    it("events: onStop", () => {
        const onStop = vitest.fn();
        const runner = effect(() => { }, {
            onStop,
        });

        stop(runner);
        expect(onStop).toHaveBeenCalled();
    });
})