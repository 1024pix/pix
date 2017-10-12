const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {

  serialize(snapshots) {
    return new Serializer('snapshot', {
      attributes: ['score', 'createdAt', 'completionPercentage', 'user', 'studentCode', 'campaignCode'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName']
      },
      transform(snapshot) {
        snapshot.id = snapshot.id.toString();
        snapshot.completionPercentage = snapshot.completionPercentage && snapshot.completionPercentage.toString() || null;
        snapshot.score = snapshot.score && snapshot.score.toString() || null;
        return snapshot;
      }
    }).serialize(snapshots);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((snapshot => {
        snapshot.organization = {
          id: json.data.relationships.organization.data.id
        };
        return snapshot;
      }));
  }

};
