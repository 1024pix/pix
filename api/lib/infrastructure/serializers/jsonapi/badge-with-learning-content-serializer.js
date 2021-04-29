const { Serializer } = require('jsonapi-serializer');
const BadgeCriterion = require('../../../domain/models/BadgeCriterion');

const mapType = {
  badgeCriteria: 'badge-criteria',
  badgePartnerCompetences: 'badge-partner-competences',
  partnerCompetences: 'badge-partner-competences',
};

module.exports = {
  serialize(badgeWithLearningContent = {}) {
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
        attributes: ['name', 'skills'],
        skills: {
          include: true,
          ref: 'id',
          attributes: ['name', 'difficulty', 'tube'],
          tube: {
            include: true,
            ref: 'id',
            attributes: ['practicalTitle'],
          },
        },
      },
      typeForAttribute(attribute) {
        return mapType[attribute];
      },
      transform(record) {
        const badge = record.badge;
        badge.badgeCriteria.forEach((badgeCriterion) => {
          if (badgeCriterion.scope === BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE) {
            badgeCriterion.partnerCompetences = badge.badgePartnerCompetences.map(({ id }) => {
              return { id };
            });
          } else {
            badgeCriterion.partnerCompetences = badgeCriterion.partnerCompetenceIds?.map((partnerCompetenceId) => {
              return { id: partnerCompetenceId };
            });
          }
        });
        badge.badgePartnerCompetences.forEach((badgePartnerCompetence) => {
          badgePartnerCompetence.skills = badgePartnerCompetence.skillIds.map((skillId) => {
            return record.skills.find(({ id }) => skillId === id);
          });
          badgePartnerCompetence.skills.forEach((skill) => {
            skill.tube = { ...record.tubes.find(({ id }) => id === skill.tubeId) };
          });
        });
        return { ...badge };
      },

    }).serialize(badgeWithLearningContent);
  },
};
