const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(reports) {
    return new Serializer('campaign-report', {
      attributes: ['participationsCount', 'sharedParticipationsCount'],
    }).serialize(reports);
  },
};
