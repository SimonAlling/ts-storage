import { is, isLike, isNull, isNumber } from "ts-type-guards";

export const enum Status {
    OK = "OK",
    ABSENT = "ABSENT",
    TYPE_ERROR = "TYPE_ERROR",
    JSON_ERROR = "JSON_ERROR",
    STORAGE_ERROR = "STORAGE_ERROR",
    NUMBER_ERROR = "NUMBER_ERROR",
}

export interface Response<T> {
    status: Status;
    value: T;
}

export type BasicTypes = boolean | number | string

export type Dictionary<K extends string, T extends { [key in K]: AllowedTypes }> = T

export type ItemTypes = BasicTypes | Dictionary<string, { [key: string]: AllowedTypes }>

export type AllowedTypes = ItemTypes | ReadonlyArray<ItemTypes>

export function get<T extends AllowedTypes>(key: string, fallback: T): Response<T> {
    return getFrom(localStorage, key, fallback);
}

export function get_session<T extends AllowedTypes>(key: string, fallback: T): Response<T> {
    return getFrom(sessionStorage, key, fallback);
}

export function set<T extends AllowedTypes>(key: string, value: T): Response<T> {
    return setIn(localStorage, key, value);
}

export function set_session<T extends AllowedTypes>(key: string, value: T): Response<T> {
    return setIn(sessionStorage, key, value);
}

export function remove(key: string): Response<boolean> {
    return removeIn(localStorage, key);
}

export function remove_session(key: string): Response<boolean> {
    return removeIn(sessionStorage, key);
}

function getFrom<T extends AllowedTypes>(storage: Storage, key: string, fallback: T): Response<T> {
    try {
        const savedValue: T | null = readFrom(storage, key, fallback);
        if (isNull(savedValue)) {
            // There was no saved value.
            return {
                status: Status.ABSENT,
                value: fallback,
            };
        } else {
            // There was a valid saved value.
            return {
                status: Status.OK,
                value: savedValue,
            };
        }
    } catch (err) {
        const status = (
            // The saved value could not be parsed.
            is(SyntaxError)(err) ? Status.JSON_ERROR
            :
            // The saved value had the wrong type.
            is(TypeError)(err) ? Status.TYPE_ERROR
            :
            // Something went wrong when trying to access storage.
            Status.STORAGE_ERROR
        );
        return {
            status,
            value: fallback,
        };
    }
}

function setIn<T extends AllowedTypes>(storage: Storage, key: string, value: T): Response<T> {
    try {
        saveIn(storage, key, value);
        return {
            status: Status.OK,
            value,
        };
    } catch (err) {
        const status = (
            // Value was or contained -Infinity, Infinity or NaN.
            is(RangeError)(err) ? Status.NUMBER_ERROR
            :
            // Something went wrong when trying to stringify to JSON.
            is(SyntaxError)(err) || is(TypeError)(err) ? Status.JSON_ERROR
            :
            // Something went wrong when trying to access storage.
            Status.STORAGE_ERROR
        );
        return {
            status,
            value,
        };
    }
}

function removeIn(storage: Storage, key: string): Response<boolean> {
    try {
        storage.removeItem(key);
        return {
            status: Status.OK,
            value: true,
        };
    } catch (err) {
        return {
            status: Status.STORAGE_ERROR,
            value: false,
        };
    }
}

function readFrom<T extends AllowedTypes>(storage: Storage, key: string, reference: T): T | null {
    // Throws DOMException:
    const readValue: string | null = storage.getItem(key);
    if (isNull(readValue)) {
        return null;
    }
    // Throws SyntaxError:
    const parsedValue: any = JSON.parse(readValue);
    if (isLike(reference)(parsedValue)) {
        return parsedValue;
    }
    throw new TypeError(`Saved value had wrong type.`);
}

function saveIn<T extends AllowedTypes>(storage: Storage, key: string, value: T): void {
    const replacer = (_key: string, v: any) => {
        if (typeof v === "number" && !Number.isFinite(v)) {
            throw new RangeError(v.toString());
        }
        return v;
    }
    // Throws TypeError, RangeError etc:
    const stringifiedValue: string = JSON.stringify(value, replacer);
    // Throws DOMException:
    storage.setItem(key, stringifiedValue);
}
