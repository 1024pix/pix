'use strict';

const base = require('../../config/airtable').base;
const Solution = require('../models/referential/solution');

const AIRTABLE_TABLE_NAME = 'Epreuves';

module.exports = {

  get(id) {

    return new Promise((resolve, reject) => {

      base(AIRTABLE_TABLE_NAME).find(id, (error, record) => {

        if (error) {
          return reject(error);
        }
        return resolve(new Solution(record));
      });
    });
  }

};
