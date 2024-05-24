export interface EffectRunner<T = any> {
    (): T,
    effect?: ReactiveEffect
}

export interface EffectOptions {
    scheduler?: (f: EffectRunner) => void;
    lazy?: boolean;
    onStop?: () => void;
}


const targetMap = new WeakMap<object, Map<string | symbol, Set<ReactiveEffect>>>();
let activeEffect: ReactiveEffect | undefined = void 0;
const effectStack: ReactiveEffect[] = [];

export class ReactiveEffect<T = any> {
    private _fn: EffectRunner<T>;
    public scheduler: any;
    public active: boolean = true;
    deps: Set<ReactiveEffect>[] = [];
    onStop = () => { };
    constructor(fn: EffectRunner<T>, scheduler?: (f: EffectRunner) => void, onStop?: () => void) {
        this._fn = fn;
        this.scheduler = scheduler;
        if (onStop) this.onStop = onStop;
    }

    public run() {
        if (!this.active) return this._fn();
        activeEffect = this;
        effectStack.push(this);
        try {
            cleanupEffect(this);
            const res = this._fn();
            return res;
        } finally {
            effectStack.pop();
            activeEffect = effectStack[effectStack.length - 1];
        }
    }

    public stop() {
        cleanupEffect(this);
        this.active = false;
        this.onStop();

    }
}

export function cleanupEffect(effect: ReactiveEffect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}

export function effect<T = any>(
    fn: EffectRunner<T>,
    options: EffectOptions = {},
) {
    const _effect = new ReactiveEffect(fn, options.scheduler, options.onStop);
    if (!options.lazy) {
        _effect.run();
    }
    const runner = _effect.run.bind(_effect) as EffectRunner;
    runner.effect = _effect;
    return runner;
}

export function track(target: object, key: string | symbol) {
    if (!activeEffect) return;

    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }

    if (!deps.has(activeEffect)) {
        deps.add(activeEffect);
        activeEffect.deps.push(deps);
    }
}

export function trigger(target: object, key: string | symbol) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    const effects = depsMap.get(key);
    if (effects) {
        effects.forEach(effect => {
            if (effect !== activeEffect) {
                effect.scheduler ?
                    effect.scheduler(effect.run) :
                    effect.run();
            }
        });
    }
}

export function stop(runner: EffectRunner) {
    runner.effect && runner.effect.stop();

}