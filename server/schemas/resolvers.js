const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // query to access user by their token
        me: async (parent, args, context) => {
            // When the request is made to the server, it is intercepted by Apollo for authentication. If the token is successfully detected, then we pass back the req as context with .user key
            // .user key contatins token in ._id key
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

                return userData;
            }
            throw new AuthenticationError('Not logged in')
        },

    },

    Mutation: {
        // add a user to Users
        addUser: async (parent, args) => {
            // args = { email, username, password } objects
            const user = await User.create(args);
            // attach jwt to created user
            const token = signToken(user);
            // returns Auth type object { token: ID!, user: User }
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            // if no user found through email, throw error
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            // check to see if password matches encrypted password
            const correctPw = await user.isCorrectPassword(password);

            // throw error if incorrect
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            // sign jwt to user upon login
            const token = signToken(user);
            //  return auth type { token:ID, user: User } object
            return { token, user };
        },

        saveBook: async (parent, { bookData }, context) => {
            // check if user is logged in
            if (context.user) {
                // find user based on _id thru context
                // use addToSet to add book based on book objected passed in thru args
                // addToSet is used to ensure unique entries
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                );

                return updatedUser;
            }

            // throw error if user is not logged in
            throw new AuthenticationError('You need to be logged in');
        },

        // destructure args to get id of book to be deleted
        removeBook: async (parent, { bookId }, context) => {
            // check user login status
            if (context.user) {
                // find user by id thru context, pull book from savedBooks by bookId passed through args
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId} } },
                    { new: true }
                );

                return updatedUser;
            }
            // throw error if user not logged in
            throw new AuthenticationError('You need to be logged in');
        },
    },
};

module.exports = resolvers;
