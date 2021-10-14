const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const mapType = {
  badgeCriteria: 'badge-criteria',
  skillSets: 'skill-sets',
};

module.exports = {
  serialize(badgeWithLearningContent = {}) {
    return new Serializer('badge', {
      ref: 'id',
      attributes: ['altMessage', 'imageUrl', 'message', 'key', 'title', 'isCertifiable', 'badgeCriteria', 'skillSets'],
      badgeCriteria: {
        include: true,
        ref: 'id',
        attributes: ['threshold', 'scope', 'skillSets'],
        skillSets: {
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
      typeForAttribute(attribute) {
        return mapType[attribute];
      },
      transform(record) {
        const badge = record.badge;
        badge.badgeCriteria.forEach((badgeCriterion) => {
          badgeCriterion.skillSets = badgeCriterion.skillSetIds?.map((skillSetId) => {
            return { id: skillSetId };
          });
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
        return { ...badge };
      },
    }).serialize(badgeWithLearningContent);
  },
};
