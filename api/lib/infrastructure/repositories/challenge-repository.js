const Airtable = require('../airtable');
const cache = require('../cache');
const logger = require('../logger');
const Challenge = require('../../domain/models/referential/challenge');

const AIRTABLE_TABLE_NAME = 'Epreuves';

module.exports = {

  list() {

    return new Promise((resolve, reject) => {

      const cacheKey = 'challenge-repository_list';

      cache.get(cacheKey, (err, cachedValue) => {

        if (err) return reject(err);

        if (cachedValue) return resolve(cachedValue);

        let challenges = [];

        Airtable.base(AIRTABLE_TABLE_NAME)
          .select()
          .eachPage((records, fetchNextPage) => {

            for (let record of records) {
              challenges.push(new Challenge(record));
            }

            fetchNextPage();
          }, (err) => {

            if (err) return reject(err);

            cache.set('challenge-repository_list', challenges);

            logger.debug('Fetched and cached challenges');

            return resolve(challenges);
          });
      });

    });
  },

  get(id) {

    return new Promise((resolve, reject) => {

      const cacheKey = `challenge-repository_get_${id}`;

      cache.get(cacheKey, (err, cachedValue) => {

        if (err) return reject(err);

        if (cachedValue) return resolve(cachedValue);

        return this._fetch(id, reject, cacheKey, resolve);
      });
    });
  },

  refresh(id) {

    return new Promise((resolve, reject) => {

      const cacheKey = `challenge-repository_get_${id}`;

      cache.del(cacheKey, (err, count) => {

        if (err) return reject(err);

        if (count > 0) logger.debug(`Deleted from cache challenge ${id}`);

        return this._fetch(id, reject, cacheKey, resolve);
      });
    });
  },

  _fetch: function (id, reject, cacheKey, resolve) {

    Airtable.base(AIRTABLE_TABLE_NAME).find(id, (err, record) => {

      if (err) return reject(err);

      const challenge = new Challenge(record);

      cache.set(cacheKey, challenge);

      logger.debug(`Fetched and cached challenge ${id}`);

      return resolve(challenge);
    });
  }

};
