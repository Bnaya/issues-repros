import { a } from "../src/a";

jest.mock(
  "asd",
  () => {
    return {
      b: () => {
        return "the Mocked b";
      }
    };
  },
  { virtual: true }
);

describe("Test a", () => {
  test("bla", () => {


    expect(a()).toBe("the Mocked b");
  });
});
