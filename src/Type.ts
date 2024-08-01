/**
 * The class for deep checking Types
 */
export class Type {

    /**
     * The value to generate a deep Type of
     */
    value: unknown;

    /**
     * The shallow type of this
     */
    is: string;

    /**
     * The parent of this Type
     */
    private parent: Type | null;

    /**
     * The child keys of this Type
     */
    private childKeys: Map<string, Type>;

    /**
     * The child values of this Type
     */
    private childValues: Map<string, Type>;

    /**
     * @param value The value to generate a deep Type of
     * @param parent The parent value used in recursion
     */
    constructor(value: unknown, parent: Type | null = null) {
        const Constructor = this.constructor as typeof Type;

        this.value = value;
        this.is = Constructor.resolve(value);
        this.parent = parent;
        this.childKeys = new Map();
        this.childValues = new Map();
    }

    /**
     * The type string for the children of this Type
     */
    private get childTypes(): string {
        const Constructor = this.constructor as typeof Type;
        if (!this.childValues.size) return '';
        return `<${(this.childKeys.size ? `${Constructor.list(this.childKeys)}, ` : '') + Constructor.list(this.childValues)}>`;
    }

    /**
     * The full type string generated.
     */
    toString(): string {
        if (!this.childValues.size) this.check();
        return this.is + this.childTypes;
    }

    /**
     * Walks the linked list backwards, for checking circulars.
     */
    private *parents(): IterableIterator<Type> {
        // eslint-disable-next-line consistent-this, @typescript-eslint/no-this-alias
        let current = this;
        // @ts-ignore
        // eslint-disable-next-line no-cond-assign
        while (current = current.parent) yield current;
    }

    /**
     * Checks if the value of this Type is a circular reference to any parent.
     */
    private isCircular(): boolean {
        for (const parent of this.parents()) if (parent.value === this.value) return true;
        return false;
    }

    /**
     * The subtype to create based on this.value's sub value.
     * @param value The sub value
     */
    private addValue(value: unknown) {
        const Constructor = this.constructor as typeof Type;
        const child = new Constructor(value, this);
        this.childValues.set(child.is, child);
    }

    /**
     * The subtype to create based on this.value's entries.
     * @param entry the entry
     */
    private addEntry([key, value]: [string, unknown]) {
        const Constructor = this.constructor as typeof Type;
        const child = new Constructor(key, this);
        this.childKeys.set(child.is, child);
        this.addValue(value);
    }

    /**
     * Get the deep type name that defines the input.
     */
    async check() {
        if (Object.isFrozen(this)) return;
        const promise = await getPromiseDetails(this.value);
        if (typeof this.value === 'object' && this.isCircular()) this.is = `[Circular:${this.is}]`;
        else if (promise && promise[0]) this.addValue(promise[1]);
        else if (this.value instanceof Map) for (const entry of this.value) this.addEntry(entry);
        else if (Array.isArray(this.value) || this.value instanceof Set) for (const value of this.value) this.addValue(value);
        else if (this.is === 'Object') this.is = 'any';
        Object.freeze(this);
    }

    /**
     * Resolves the type name that defines the input.
     * @param value The value to get the type name of
     */
    static resolve(value: any): string {
        const type = typeof value;
        switch (type) {
            case 'object': return value === null ? 'null' : (value.constructor && value.constructor.name) || 'any';
            case 'function': return `${value.constructor.name}(${value.length}-arity)`;
            case 'undefined': return 'void';
            default: return type;
        }
    }

    /**
     * Joins the list of child types.
     * @param values The values to list
     */
    private static list(values: Map<string, Type>): string {
        return values.has('any') ? 'any' : [...values.values()].sort().join(' | ');
    }
}

export function isThenable(input: unknown): input is Thenable {
	if (typeof input !== 'object' || input === null) return false;
	return (input instanceof Promise) ||
		(input !== Promise.prototype && hasThen(input) && hasCatch(input));
}

export async function getPromiseDetails<T>(promise: Promise<T> | T): Promise<[number, T] | undefined> {
	if (!isThenable(promise)) return;

	const PromiseStatus = {
		PENDING: 0,
		FULFILLED: 1,
		REJECTED: 2
	};

	const detailsKey = Symbol();
	const statefulPromise = promise as any;

	// eslint-disable-next-line no-prototype-builtins
	if (statefulPromise.hasOwnProperty(detailsKey)) {
		return statefulPromise[detailsKey];
	}

	statefulPromise[detailsKey] = [PromiseStatus.PENDING, undefined];

	await promise.then((resolvedValue) => {
		statefulPromise[detailsKey] = [PromiseStatus.FULFILLED, resolvedValue];
	},
	(error) => {
		statefulPromise[detailsKey] = [PromiseStatus.REJECTED, error];
	}
	);

	return statefulPromise[detailsKey];
}

export interface Thenable {
	then: Function;
	catch: Function;
}

export function hasThen(input: { then?: Function }): boolean {
	return Reflect.has(input, 'then') && isFunction(input.then);
}

export function hasCatch(input: { catch?: Function }): boolean {
	return Reflect.has(input, 'catch') && isFunction(input.catch);
}

export function isFunction(input: unknown): input is Function {
	return typeof input === 'function';
}
