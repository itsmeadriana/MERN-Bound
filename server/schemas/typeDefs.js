// Import gql tagged template function
const { gql } = require('apollo-server-express');

// Create typedefs
const typeDefs = gql`
  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(authors: [String]!, description: String!, title: String!, bookId: String!, image: String!): User
    removeBook(bookId: String!): User
  }

  type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
  }

  input BookInput{
    bookId: ID!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  type Book {
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
  }

  type Auth {
    token: ID!
    user: User
  }
`;

// Export typedefs
module.exports = typeDefs;