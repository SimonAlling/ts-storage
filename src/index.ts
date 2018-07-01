import { is, isLike, isNull, isNumber } from "ts-type-guards";

export const enum Status {
    OK,
    ABSENT,
    TYPE_ERROR,
    JSON_ERROR,
    LOCALSTORAGE_ERROR,
}

export interface Response<T> {
    status: Status;
    value: T;
}

const SPECIAL_NUMBERS: { readonly [key: string]: number } = {
    "Infinity": Infinity,
    "-Infinity": -Infinity,
    "NaN": NaN,
};

export function get<T>(key: string, fallback: T): Response<T> {
    try {
        const savedValue: T | null = readFromLocalStorage(key, fallback);
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
            // Something went wrong when trying to access localStorage.
            Status.LOCALSTORAGE_ERROR
        );
        return {
            status,
            value: fallback,
        };
    }
}

export function set<T>(key: string, value: T): Response<T> {
    try {
        saveToLocalStorage(key, value);
        return {
            status: Status.OK,
            value,
        };
    } catch (err) {
        const status = (
            // Something went wrong when trying to stringify to JSON.
            is(SyntaxError)(err) || is(TypeError)(err) ? Status.JSON_ERROR
            :
            // Something went wrong when trying to access localStorage.
            Status.LOCALSTORAGE_ERROR
        );
        return {
            status,
            value,
        };
    }
}

function readFromLocalStorage<T>(key: string, reference: T): T | null {
    // Throws DOMException:
    const readValue: string | null = localStorage.getItem(key);
    if (isNull(readValue)) {
        return null;
    }
    // Handle ±Infinity and NaN:
    const specialNumber: number | undefined = SPECIAL_NUMBERS[readValue];
    if (isLike(reference)(specialNumber)) {
        return specialNumber;
    }
    // Throws SyntaxError:
    const parsedValue: any = JSON.parse(readValue);
    if (isLike(reference)(parsedValue)) {
        return parsedValue;
    }
    throw new TypeError(`Saved value had wrong type.`);
}

function saveToLocalStorage<T>(key: string, value: T): void {
    // Throws TypeError etc:
    const stringifiedValue: string = stringify(value);
    // Throws DOMException:
    localStorage.setItem(key, stringifiedValue);
}

function stringify(x: any): string {
    for (const representation in SPECIAL_NUMBERS) {
        const n = SPECIAL_NUMBERS[representation];
        if (x === n || Number.isNaN(x) && Number.isNaN(n)) {
            return representation;
        }
    }
    return JSON.stringify(x);
}
