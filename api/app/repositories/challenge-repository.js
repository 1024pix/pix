'use strict';

const base = require('../../config/airtable').base;
const Challenge = require('../models/referential/challenge');

const AIRTABLE_TABLE_NAME = 'Epreuves';

module.exports = {

  list() {

    let challenges = [];

    return new Promise((resolve, reject) => {

      base(AIRTABLE_TABLE_NAME)
        .select()
        .eachPage((records, fetchNextPage) => {

          for (let record of records) {
            challenges.push(new Challenge(record));
          }
          fetchNextPage();
        }, (error) => {

          if (error) {
            return reject(error);
          }
          return resolve(challenges);
        });
    });
  },

  get(id) {

    return new Promise((resolve, reject) => {

      base(AIRTABLE_TABLE_NAME).find(id, (error, record) => {

        if (error) {
          return reject(error);
        }
        return resolve(new Challenge(record));
      });
    });
  }
};
