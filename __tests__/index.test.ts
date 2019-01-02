import * as Storage from "../src/index";

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
