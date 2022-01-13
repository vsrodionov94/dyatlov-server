const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const migration = require('./functions/migration');
require('dotenv').config();

const { PORT, NODE_ENV, DB_LINK } = process.env;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const testLink = 'mongodb://localhost:27017/dyatlov';
const dbLink = NODE_ENV === 'production' ? DB_LINK : testLink;
mongoose.connect(dbLink, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.listen(NODE_ENV === 'production' ? PORT : 4000, () => {
  migration();
  routes(app);
});
