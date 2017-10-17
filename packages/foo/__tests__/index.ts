import foo from "../src/index";

describe("Test foo", () => {
  test("Foo", () => {
    it("foo", () => {
      expect(foo()).toEqual(1);
    });
  });
});
