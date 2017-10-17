import foo from "../src/index";

describe("Test foo", () => {
  describe("Foo", () => {
    it("foo", () => {
      expect(foo()).toEqual(1);
    });
  });
});
