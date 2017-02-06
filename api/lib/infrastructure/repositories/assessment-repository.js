const Assessment = require('../../domain/models/data/assessment');

module.exports = {

  get(id) {

    return new Promise((resolve, reject) => {

      Assessment
        .where('id', id)
        .fetch({ withRelated: ['answers'] })
        .then(resolve)
        .catch(reject);
    });
  }
};
