
const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken }  = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // only logged-in users should be able to use this mutation, hence why we check for the existence of context.user
      if (context.user) {
        const userData = await User.findById({ _id: context.user._id })
          .select('-__v -password')
          // .populate('bookCount')
          // .populate('savedBooks');

        return userData;
      }
      throw new AuthenticationError('Not logged in');
    }
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

    // save book to user's saved books
    saveBook: async (parent, args , context) => {
      if (context.user) {
        const updatedBook = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: {...args} } }, // get all data from args to push to savedBooks
          { new: true } // use { new: true } flag so Mongo will return the updated document instead of the original document
        );
        return updatedBook;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    // remove book from saved books
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return updatedUser;
      }

      throw new AuthenticationError('You need to be logged in!');
    }
  }
};

module.exports = resolvers;