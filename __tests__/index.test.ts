import * as Storage from "../src/index";
import { Status } from "../src/index";

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});


it("exports what it should", () => {
    expect(typeof Storage.set).toBe("function");
    expect(typeof Storage.get).toBe("function");
    expect(typeof Storage.remove).toBe("function");
    expect(typeof Storage.set_session).toBe("function");
    expect(typeof Storage.get_session).toBe("function");
    expect(typeof Storage.remove_session).toBe("function");
    expect(Storage.Status.ABSENT).toBeDefined();
    expect(Storage.Status.JSON_ERROR).toBeDefined();
    expect(Storage.Status.OK).toBeDefined();
    expect(Storage.Status.STORAGE_ERROR).toBeDefined();
    expect(Storage.Status.TYPE_ERROR).toBeDefined();
});

it("can set and get localStorage data", () => {
    expect(Storage.set("five", 5)).toEqual({ status: Status.OK, value: 5 });
    expect(Storage.get("five", 42)).toEqual({ status: Status.OK, value: 5 });
});

it("can set and get sessionStorage data", () => {
    expect(Storage.set_session("five", 5)).toEqual({ status: Status.OK, value: 5 });
    expect(Storage.get_session("five", 42)).toEqual({ status: Status.OK, value: 5 });
});

it("can handle empty keys", () => {
    expect(Storage.set("", 5)).toEqual({ status: Status.OK, value: 5 });
    expect(Storage.get("", 42)).toEqual({ status: Status.OK, value: 5 });
});

it("can handle absent errors", () => {
    expect(Storage.get("five", 42)).toEqual({ status: Status.ABSENT, value: 42 });
});

it("can handle number errors", () => {
    [ -Infinity, Infinity, NaN ].forEach(weirdNumber => {
        [
            weirdNumber,
            { five: 5, weird: weirdNumber },
            [ 5, weirdNumber ],
        ].forEach(weirdValue => {
            expect(Storage.set("weird", weirdValue)).toEqual({ status: Status.NUMBER_ERROR, value: weirdValue });
            expect(Storage.get("weird", "default").status).toBe(Status.ABSENT);
        });
    });
});

it("can handle type errors", () => {
    Storage.set("five", "5");
    expect(Storage.get("five", 42)).toEqual({ status: Status.TYPE_ERROR, value: 42 });
    Storage.set("numberArray", ["5"]);
    expect(Storage.get("numberArray", [42])).toEqual({ status: Status.TYPE_ERROR, value: [42] });
});

it("can handle JSON errors", () => {
    type Circular = { c: Circular | string };
    const circular: Circular = { c: "c" };
    circular.c = circular;
    expect(Storage.set("circular", circular).status).toBe(Status.JSON_ERROR);
    localStorage.setItem("unterminated", '"');
    expect(Storage.get("unterminated", 42)).toEqual({ status: Status.JSON_ERROR, value: 42 });
});

it.skip("can handle localStorage errors", () => {
    // We cannot provoke a localStorage error in Jest.
});

it("can set and get nested arrays", () => {
    Storage.set("arrays", [[5]]);
    expect(Storage.get("arrays", [[42]])).toEqual({ status: Status.OK, value: [[5]] });
});

it("can set and get dictionaries", () => {
    Storage.set("dictionary", { foo: "foo", fortytwo: 42 });
    expect(Storage.get("dictionary", { foo: "bar", fortytwo: 0 })).toEqual({ status: Status.OK, value: { foo: "foo", fortytwo: 42 } });
});

it("can set and get nested dictionaries", () => {
    const DICT = { array: [ 1, 2, 3 ], dict: { foo: "foo" } };
    Storage.set("dictionary", DICT);
    expect(Storage.get("dictionary", { array: [], dict: { foo: "" } })).toEqual({ status: Status.OK, value: DICT });
});
