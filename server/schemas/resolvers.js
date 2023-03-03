const {
	AuthenticationError,
	UserInputError,
} = require("apollo-server-express");
const { signToken } = require("../utils/auth");
const { User } = require("../models");

const resolvers = {
	Query: {
		me: async (parent, args, { user }) => {
			if (!user) {
				throw new AuthenticationError("You must be logged in");
			}
			const foundUser = await User.findById(user._id);
			return foundUser;
		},
	},
	Mutation: {
		login: async (parent, { email, password }) => {
			console.log("test");
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticationError("No user found with this email address");
			}

			const correctPw = await user.isCorrectPassword(password);

			if (!correctPw) {
				throw new AuthenticationError("Incorrect credentials");
			}

			const token = signToken(user);

			return { token, user };
		},
		addUser: async (parent, { username, email, password }) => {
			const user = await User.create({ username, email, password });
			const token = signToken(user);
			return { token, user };
		},
		saveBook: async (parent, { book }, { user }) => {
			if (!user) {
			  throw new AuthenticationError(
				"You need to be logged in to save a book."
			  );
			}
			try {
			  const updatedUser = await User.findOneAndUpdate(
				{ _id: user._id },
				{ $addToSet: { savedBooks: book } },
				{ new: true }
			  );
			  return updatedUser;
			} catch (error) {
			  console.error(error);
			  throw new UserInputError("Something went wrong while saving the book.");
			}
		  },
		removeBook: async (parent, { bookId }, { user }) => {
			if (!user) {
				throw new AuthenticationError(
					"You need to be logged in to remove a book."
				);
			}
			try {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: user._id },
					{ $pull: { savedBooks: { bookId: bookId } } },
					{ new: true }
				);
				return updatedUser;
			} catch (error) {
				console.error(error);
				throw new UserInputError(
					"Something went wrong while removing the book."
				);
			}
		},
	},
};

module.exports = resolvers;
