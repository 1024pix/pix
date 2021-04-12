const { Serializer } = require('jsonapi-serializer');

const mapType = {
  badgeCriteria: 'badge-criterion',
  badgePartnerCompetences: 'badge-partner-competence',
};

module.exports = {
  serialize(badge = {}) {
    return new Serializer('badge', {
      ref: 'id',
      attributes: ['altMessage', 'imageUrl', 'message', 'key', 'title', 'isCertifiable', 'badgeCriteria', 'badgePartnerCompetences'],
      badgeCriteria: {
        include: true,
        ref: 'id',
        attributes: ['threshold', 'scope'],
      },
      badgePartnerCompetences: {
        include: true,
        ref: 'id',
        attributes: ['name'],
      },
      typeForAttribute: (attribute) => {
        return mapType[attribute];
      },
    }).serialize(badge);
  },
};
