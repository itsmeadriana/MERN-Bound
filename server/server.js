const express = require('express');
const { ApolloServer } = require ('apollo-server-express');
const path = require('path');
const mongoose = require('mongoose');

const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/googlebooks"

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  })

  await server.start();

  server.applyMiddleware({ app });
}

startServer();

  // Serve up static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
  });

// db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  // });
});