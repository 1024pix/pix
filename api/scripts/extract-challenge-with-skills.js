#! /usr/bin/env node
const _ = require('lodash');
const challengeRepository = require('../lib/infrastructure/repositories/challenge-repository');
const skillsRepository = require('../lib/infrastructure/repositories/skill-repository');
const competencesRepository = require('../lib/infrastructure/repositories/competence-repository');

async function main () {

  // Récupération des challenges
  let challenges = await challengeRepository.list();

  // Récupération des compétences (pour les acquis)
  const competences = await competencesRepository.list();

  // Récupération des acquis par compétences
  let skills = await Promise.all(
    _.map(competences, (competence) => {
     return skillsRepository.findByCompetenceId(competence.id);
    })
  );
  skills = _.flatten(skills);

  // Ajout du niveau et du tube sur les objets sur les skills
  // Ajout des acquis inférieurs et supérieurs
  _(skills)
    .forEach((skill) => {
      skill.level = skill.name.slice(-1);
      skill.tube = skill.name.substring(1, skill.name.length-1);
    })
    .forEach((skill) => {
      skill.lowerSkills = _.filter(skills,(s) => {
          return s.tube === skill.tube && s.level < skill.level;
        });
      skill.higherSkills = _.filter(skills,(s) => {
        return s.tube === skill.tube && s.level > skill.level;
      });
    });

  // Filtres des challenges pour ne garder que ceux qui ont des acquis et qui sont valides
  _(challenges).filter((c) => {
    return c.skills.length > 0;
  });


  // Création des objets qui nous permettront de créer les knowledges elements
  const informationForKnowledgeElements = _.map(challenges, (challenge) => {

    const skillsFromChallenge =  challenge.skills;

    // Ajout des acquis gagnés si la question est validé
    const skillsValidated = _(skillsFromChallenge)
      .map((skillGivenByChallenge) => {
        const skill = _.find(skills, { id: skillGivenByChallenge.id });
        return skill.lowerSkills;
      })
      .flatten()
      .remove((skillValidated) => {
        return !_.some(skillsFromChallenge, (skill) => {return skill.id === skillValidated.id});
      })
      .uniqBy('id')
      .value();

    // Ajout des acquis invalidé si la question n'est pas réussi
    const skillsInvalidated = _(skillsFromChallenge)
      .map((skillGivenByChallenge) => {
        const skill = _.find(skills, { id: skillGivenByChallenge.id });
        return skill.higherSkills;
      })
      .flatten()
      .remove((skillValidated) => {
        return !_.some(skillsFromChallenge, (skill) => {return skill.id === skillValidated.id});
      })
      .uniqBy('id')
      .value();

    return {
      challengeId: challenge.id,
      skillsFromChallenge,
      skillsValidated,
      skillsInvalidated,
    };
  });
  console.log(`ChallengeId;source;status;skillId;earnedPix;skillName`);

  _.forEach(informationForKnowledgeElements, (challengeWithSkills) => {
    const challengeId = challengeWithSkills.challengeId;
    _.forEach(challengeWithSkills.skillsFromChallenge, (directSkills) => {
      console.log(`${challengeId};direct;validated;${directSkills.id};${directSkills.pixValue};${directSkills.name}`)
    });
    _.forEach(challengeWithSkills.skillsValidated, (inferredValidatedSkills) => {
      console.log(`${challengeId};inferred;validated;${inferredValidatedSkills.id};${inferredValidatedSkills.pixValue};${inferredValidatedSkills.name}`)
    });
    _.forEach(challengeWithSkills.skillsFromChallenge, (directSkills) => {
      console.log(`${challengeId};direct;invalidated;${directSkills.id};0;${directSkills.name}`)
    });
    _.forEach(challengeWithSkills.skillsInvalidated, (inferredInvalidatedSkills) => {
      console.log(`${challengeId};inferred;invalidated;${inferredInvalidatedSkills.id};0;${inferredInvalidatedSkills.name}`)
    });
  });
  process.exit(1);

}

/*=================== tests =============================*/

if (require.main === module) {
  main();
}
