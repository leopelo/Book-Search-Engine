const { User } = require('../models');
const { signToken } = require('../utils/auth');
const resolvers = {
  Query: {
    me: (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('books');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
   
  },
  Mutation: {
    login: async (parent, {email, password}) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };

    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      if(!user) {
        return
      }
      
      const token = signToken(user);
      console.log(token);
      return { token, user};
    },

    
    saveBook: async (parent, {bookId}, context) => {
        if (context.user) {
          const book = await Book.create({
            bookId
          });
          await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { books: book._id } }
          );
  
          return book;
        }
        throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, {bookId}, context) => {
      if (context.user) {
        const book = await Book.findOneAndDelete({
          _id: bookId,

        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { books: book._id } }
        );

        return book;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;

