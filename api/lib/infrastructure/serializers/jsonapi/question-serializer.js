const { Serializer } = require('jsonapi-serializer');
const challengeSerializer = require('./challenge-serializer');

module.exports = {

  serialize(questions) {
    return new Serializer('challenge', {
      attributes: [
        ...challengeSerializer.attributes,
        'index',
      ],
      transform: (record) => {
        const challenge = challengeSerializer.transform(record.challenge);

        return {
          ...challenge,
          index: record.index,
        };
      },
    }).serialize(questions);
  },
};
