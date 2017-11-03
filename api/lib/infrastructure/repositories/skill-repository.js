const cache = require('../cache');
const challengeRepository = require('./challenge-repository');
const Skill = require('../../domain/models/data/skill');
const Bookshelf = require('../../infrastructure/bookshelf');

function _fetchSkillsFromCompetence(competenceId, cacheKey, resolve, reject) {
  challengeRepository.getFromCompetenceId(competenceId)
    .then(challenges => {
      const skills = new Set();
      challenges.forEach(challenge => challenge.knowledgeTags ? challenge.knowledgeTags.forEach(skill => skills.add(skill)) : null);
      cache.set(cacheKey, skills);
      return resolve(skills);
    })
    .catch(reject);
}

module.exports = {
  cache: {
    getFromCompetenceId(competenceId) {
      return new Promise((resolve, reject) => {
        const cacheKey = `skill-repository_get_from_competence_${competenceId}`;
        cache.get(cacheKey, (err, cachedValue) => {
          if (err) {
            return reject(err);
          }
          if (cachedValue) {
            return resolve(cachedValue);
          }
          return _fetchSkillsFromCompetence(competenceId, cacheKey, resolve, reject);
        });
      });
    }
  },

  db: {
    save(arraySkills) {
      const SkillCollection = Bookshelf.Collection.extend({
        model: Skill
      });

      return SkillCollection.forge(arraySkills)
        .invokeThen('save');
    }
  }
};
