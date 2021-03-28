const { UserInputError, AuthenticationError } = require("apollo-server-errors");
const jwt = require("jsonwebtoken");
const { models } = require("./db");
const secret = "catpack";

const throwError = async (message, type) => {
  if (type === "input") throw new UserInputError(message);
  if (type === "auth") throw new AuthenticationError(message);
  if (!type) throw new Error(message);
};

/**
 * takes a user object and creates  jwt out of it
 * using user.id and user.role
 * @param {Object} user the user to create a jwt for
 */
const createToken = ({ id, role }) => jwt.sign({ id, role }, secret);

/**
 * will attemp to verify a jwt and find a user in the
 * db associated with it. Catches any error and returns
 * a null user
 * @param {String} token jwt from client
 */
const getUserFromToken = (token) => {
  try {
    const user = jwt.verify(token, secret);
    return models.User.findOne({ id: user.id });
  } catch (e) {
    return null;
  }
};

/**
 * checks if the user is on the context object
 * continues to the next resolver if true
 * @param {Function} next next resolver function ro run
 */
const authenticated = (next) => (root, args, context, info) => {
  return context.user
    ? next(root, args, context, info)
    : throwError("Authentication failed!", "auth");
};

/**
 * checks if the user on the context has the specified role.
 * continues to the next resolver if true
 * @param {String} role enum role to check for
 * @param {Function} next next resolver function to run
 */
const authorized = (role, next) => (root, args, context, info) => {
  return context.user.role === role
    ? next(root, args, context, info)
    : throwError("Unauthorized!", "auth");
};

module.exports = {
  getUserFromToken,
  authenticated,
  authorized,
  createToken,
};
