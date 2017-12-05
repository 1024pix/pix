const _ = require('lodash');
const cache = require('../cache');
const challengeRepository = require('./challenge-repository');
const Skill = require('../../domain/models/data/skill');
const Bookshelf = require('../../infrastructure/bookshelf');

module.exports = {

  findByCompetence(competence) {
    const cacheKey = `skill-repository_find_by_competence_${competence.id}`;
    const cachedSkills = cache.get(cacheKey);

    if (cachedSkills) {
      return Promise.resolve(cachedSkills);
    }

    return challengeRepository.findByCompetence(competence)
      .then(challenges => {

        let skills = _(challenges)
          .map((challenge) => challenge.skills)
          .without((challenge) => _.isNil(challenge.skills))
          .flatten()
          .uniqBy('name')
          .value();

        // FIXME: Supprimer l'utilisation du Set
        skills = new Set(skills);

        cache.set(cacheKey, skills);

        return skills;
      });
  },

  save(arraySkills) {
    const SkillCollection = Bookshelf.Collection.extend({
      model: Skill
    });
    return SkillCollection.forge(arraySkills)
      .invokeThen('save');
  }
};
