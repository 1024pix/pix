const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const mapType = {
  badgeCriteria: 'badge-criteria',
  skillSets: 'skill-sets',
  badgePartnerCompetences: 'badge-partner-competences',
  partnerCompetences: 'badge-partner-competences',
};

module.exports = {
  serialize(badgeWithLearningContent = {}) {
    return new Serializer('badge', {
      ref: 'id',
      attributes: [
        'altMessage',
        'imageUrl',
        'message',
        'key',
        'title',
        'isCertifiable',
        'isAlwaysVisible',
        'badgeCriteria',
        'skillSets',
        'badgePartnerCompetences',
      ],
      badgeCriteria: {
        include: true,
        ref: 'id',
        attributes: ['threshold', 'scope', 'skillSets', 'partnerCompetences'],
        skillSets: {
          include: false,
          ref: 'id',
        },
        partnerCompetences: {
          include: false,
          ref: 'id',
        },
      },
      skillSets: {
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
          badgeCriterion.skillSets = badgeCriterion.skillSetIds?.map((skillSetId) => {
            return { id: skillSetId };
          });
          badgeCriterion.partnerCompetences = badgeCriterion.skillSets;
        });
        badge.skillSets.forEach((skillSet) => {
          const skills = skillSet.skillIds.map((skillId) => {
            return record.skills.find(({ id }) => skillId === id);
          });
          skillSet.skills = _.compact(skills);
          skillSet.skills.forEach((skill) => {
            skill.tube = { ...record.tubes.find(({ id }) => id === skill.tubeId) };
          });
        });
        badge.badgePartnerCompetences = badge.skillSets;
        return { ...badge };
      },
    }).serialize(badgeWithLearningContent);
  },
};
