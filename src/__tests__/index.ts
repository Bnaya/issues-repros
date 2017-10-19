import foo from "../index";

describe("Test foo", () => {
  test("Foo", () => {
    expect(foo()).toEqual(1);
  });
});
