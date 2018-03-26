import { is, isLike, isNull } from "ts-type-guards";

export const enum Status {
    OK,
    ABSENT,
    TYPE_ERROR,
    JSON_ERROR,
    LOCALSTORAGE_ERROR,
}

export type Response<T> = {
    status: Status
    value: T
}

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
        let status;
        if (is(SyntaxError)(err)) {
            // The saved value could not be parsed.
            status = Status.JSON_ERROR;
        } else if (is(TypeError)(err)) {
            // The saved value had the wrong type.
            status = Status.TYPE_ERROR;
        } else {
            // Something went wrong when trying to access localStorage.
            status = Status.LOCALSTORAGE_ERROR;
        }
        return {
            status: status,
            value: fallback,
        };
    }
}

export function set<T>(key: string, value: T): Response<T> {
    try {
        saveToLocalStorage(key, value);
        return {
            status: Status.OK,
            value: value,
        };
    } catch (err) {
        if (is(DOMException)(err)) {
            // Something went wrong when trying to access localStorage.
            return {
                status: Status.LOCALSTORAGE_ERROR,
                value: value,
            };
        } else {
            // Something went wrong when trying to stringify to JSON.
            return {
                status: Status.JSON_ERROR,
                value: value,
            };
        }
    }
}

function readFromLocalStorage<T>(key: string, reference: T): T | null {
    // Throws DOMException:
    const readValue: string | null = localStorage.getItem(key);
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

function saveToLocalStorage<T>(key: string, value: T): void {
    // Throws TypeError etc:
    const stringifiedValue: string = JSON.stringify(value);
    // Throws DOMException:
    localStorage.setItem(key, stringifiedValue);
}
