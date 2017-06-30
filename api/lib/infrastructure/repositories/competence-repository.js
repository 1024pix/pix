const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/competence-serializer');

const AIRTABLE_TABLE_NAME = 'Competences';
const cacheKey = 'competence-repository_list';

module.exports = {

  list() {
    return new Promise((resolve, reject) => {

      cache.get(cacheKey, (err, cachedCompetences) => {
        if(err) {
          return reject(err);
        }

        if(cachedCompetences) {
          return resolve(cachedCompetences);
        }

        airtable.getRecords(AIRTABLE_TABLE_NAME, {}, serializer)
          .then((competences) => {
            cache.set(cacheKey, competences);
            resolve(competences);
          })
          .catch(reject);
      });

    });
  },

};
