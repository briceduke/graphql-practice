const { ApolloServer, AuthenticationError } = require("apollo-server");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { createToken, getUserFromToken } = require("./auth");
const {
  formatTimeDirective,
  AuthorizationDirective,
  AuthenticationDirective,
} = require("./directives");
const db = require("./db");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatTime: formatTimeDirective,
    authorized: AuthorizationDirective,
    authenticated: AuthenticationDirective,
  },
  context({ req, connection }) {
    if (connection) return { ...connection.context, ...db };
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...db, user, createToken };
  },
  subscriptions: {
    onConnect(connectionParams) {
      const token = connectionParams.Authorization;
      const user = getUserFromToken(token);
      if (!user) throw new AuthenticationError("Login!");
      return { user };
    },
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
