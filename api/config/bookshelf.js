'use strict';

const knexConfig = require('../db/knexfile');
const settings = require('./settings');
const knex = require('knex')(knexConfig[settings.environment]);

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
