import { a } from "../src/a";

jest.mock(
  "web3",
  () => {
    return class Web3ClassMock {
      public eth = {
        defaultBlock: "pending"
      };
    };
  },
  { virtual: true }
);

describe("Test a", () => {
  test("bla", () => {
    expect(a()).toEqual(true);
  });
});
