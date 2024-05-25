export interface EffectRunner<T = any> {
    (): T;
    effect?: ReactiveEffect;
}

export interface EffectOptions {
    scheduler?: (f: EffectRunner) => void;
    lazy?: boolean;
    onStop?: () => void;
}

const targetMap = new WeakMap<object, Map<string | symbol, Set<ReactiveEffect>>>();
let activeEffect: ReactiveEffect | undefined = undefined;
const effectStack: ReactiveEffect[] = [];

export class ReactiveEffect<T = any> {
    private _fn: EffectRunner<T>;
    public scheduler?: (f: EffectRunner) => void;
    public active: boolean = true;
    public deps: Set<ReactiveEffect>[] = [];
    public onStop?: () => void;

    constructor(fn: EffectRunner<T>, scheduler?: (f: EffectRunner) => void, onStop?: () => void) {
        this._fn = fn;
        this.scheduler = scheduler;
        this.onStop = onStop;
    }

    public run() {
        if (!this.active) return this._fn();
        if (effectStack.includes(this)) return; // 防止递归调用导致死循环

        activeEffect = this;
        effectStack.push(this);
        try {
            cleanupEffect(this);
            return this._fn();
        } finally {
            effectStack.pop();
            activeEffect = effectStack[effectStack.length - 1];
        }
    }

    public stop() {
        if (this.active) {
            cleanupEffect(this);
            this.active = false;
            if (this.onStop) this.onStop();
        }
    }
}

function cleanupEffect(effect: ReactiveEffect) {
    effect.deps.forEach(dep => dep.delete(effect));
    effect.deps.length = 0;
}

export function effect<T = any>(
    fn: EffectRunner<T>,
    options: EffectOptions = {}
): EffectRunner {
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
        const effectsToRun = new Set(effects);
        effectsToRun.forEach(effect => {
            if (effect !== activeEffect) {
                if (effect.scheduler) {
                    effect.scheduler(effect.run.bind(effect));
                } else {
                    effect.run();
                }
            }
        });
    }
}

export function stop(runner: EffectRunner) {
    if (runner.effect) {
        runner.effect.stop();
    }
}
