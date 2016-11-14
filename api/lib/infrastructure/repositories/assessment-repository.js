const Assessment = require('../../domain/models/data/assessment');

module.exports = {

  get(id) {

    return new Promise((resolve, reject) => {

      Assessment.where('id', id).fetch({ withRelated: 'answers' })
        .then((assessment) => resolve(assessment))
        .catch((err) => reject(err));
      });
  }
};
