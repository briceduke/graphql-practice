const { SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const { throwError } = require("./auth");
const { formatDate } = require("./utils");

class formatTimeDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { format: defaultFormat } = this.args;
    field.args.push({
      name: "format",
      type: GraphQLString,
    });
    field.resolve = async (root, { format, ...rest }, ctx, info) => {
      const res = await resolver.call(this, root, rest, ctx, info);
      return formatDate(res, format || defaultFormat);
    };

    field.type = GraphQLString;
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    field.resolve = async (root, args, context, info) => {
      return context.user
        ? resolver(root, args, context, info)
        : throwError("Authentication failed!", "auth");
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { role } = this.args;
    field.resolve = async (root, args, context, info) => {
      return context.user.role === role
        ? resolver(root, args, context, info)
        : throwError("Unauthorized!", "auth");
    };
  }
}

module.exports = {
  formatTimeDirective,
  AuthenticationDirective,
  AuthorizationDirective,
};
