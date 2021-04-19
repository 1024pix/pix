const { Serializer } = require('jsonapi-serializer');
const BadgeCriterion = require('../../../domain/models/BadgeCriterion');

const mapType = {
  badgeCriteria: 'badge-criterion',
  badgePartnerCompetences: 'badge-partner-competence',
  partnerCompetences: 'badge-partner-competence',
};

module.exports = {
  serialize(badge = {}) {
    return new Serializer('badge', {
      ref: 'id',
      attributes: ['altMessage', 'imageUrl', 'message', 'key', 'title', 'isCertifiable', 'badgeCriteria', 'badgePartnerCompetences'],
      badgeCriteria: {
        include: true,
        ref: 'id',
        attributes: ['threshold', 'scope', 'partnerCompetences'],
        partnerCompetences: {
          include: false,
          ref: 'id',
        },
      },
      badgePartnerCompetences: {
        include: true,
        ref: 'id',
        attributes: ['name'],
      },
      typeForAttribute(attribute) {
        return mapType[attribute];
      },
      transform(record) {
        record.badgeCriteria.forEach((badgeCriterion) => {
          if (badgeCriterion.scope === BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE) {
            badgeCriterion.partnerCompetences = record.badgePartnerCompetences.map(({ id }) => {
              return { id };
            });
          } else {
            badgeCriterion.partnerCompetences = badgeCriterion.partnerCompetenceIds?.map((partnerCompetenceId) => {
              return { id: partnerCompetenceId };
            });
          }
        });
        return record;
      },

    }).serialize(badge);
  },
};
