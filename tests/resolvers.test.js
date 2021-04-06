const resolvers = require("../src/resolvers");

describe("resolvers", () => {
  test("feed", () => {
    const res = resolvers.Query.feed(null, null, {
      models: {
        Post: {
          findMany() {
            return ["hello"];
          },
        },
      },
    });

    expect(res).toEqual(["hello"]);
  });
});
