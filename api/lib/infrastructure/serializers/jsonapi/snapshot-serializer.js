const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(snapshots, meta) {
    return new Serializer('snapshot', {
      attributes: ['score', 'createdAt', 'testsFinished', 'user', 'studentCode', 'campaignCode'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName']
      },
      transform(json) {
        const snapshot = Object.assign({}, json);
        snapshot.testsFinished = json.testsFinished && json.testsFinished.toString() || null;
        snapshot.score = json.score && json.score.toString() || null;
        return snapshot;
      },
      meta
    }).serialize(snapshots);
  },
};
