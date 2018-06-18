const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(skillReview) {
    return new Serializer('skill-review', {
      attributes: ['assessment', 'profileMastery'],
      assessment: {
        ref: 'id',
      }
    }).serialize(skillReview);
  }

};
