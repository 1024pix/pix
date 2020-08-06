const _ = require('lodash');

const Correction = require('../../domain/models/Correction');
const Hint = require('../../domain/models/Hint');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const tutorialRepository = require('./tutorial-repository');
const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];
const { ENGLISH_SPOKEN } = require('../../domain/constants').LOCALE;

module.exports = {

  async getByChallengeId({ challengeId, userId, locale }) {
    const challenge = await challengeDatasource.get(challengeId);
    const skills = await _getSkills(challenge);
    const hints = await _getHints(skills, locale);

    const tutorials = await _getTutorials({ userId, skills, tutorialIdsProperty: 'tutorialIds', locale });
    const learningMoreTutorials = await _getTutorials({ userId, skills, tutorialIdsProperty: 'learningMoreTutorialIds', locale });

    return new Correction({
      id: challenge.id,
      solution: challenge.solution,
      hints,
      tutorials,
      learningMoreTutorials: learningMoreTutorials,
    });
  }
};

async function _getHints(skills, locale) {
  const skillsWithHints = await _filterSkillsWithValidatedHint(skills);
  return _convertSkillsToHints(skillsWithHints, locale);
}

function _getSkills(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}

function _filterSkillsWithValidatedHint(skillDataObjects) {
  return skillDataObjects.filter((skillDataObject) => VALIDATED_HINT_STATUSES.includes(skillDataObject.hintStatus));
}

function _getTranslatedText(locale, translations = { frenchText: '', englishText: '' }) {
  if (locale === ENGLISH_SPOKEN) {
    return translations.englishText;
  }

  return translations.frenchText;
}

function _convertSkillsToHints(skillDataObjects, locale) {
  return skillDataObjects.map((skillDataObject) => {
    return new Hint({
      skillName: skillDataObject.name,
      value: _getTranslatedText(locale, { frenchText: skillDataObject.hintFrFr, englishText: skillDataObject.hintEnUs }),
    });
  });
}

async function _getTutorials({ userId, skills, tutorialIdsProperty, locale }) {
  const tutorialsIds = _(skills)
    .map((skill) => skill[tutorialIdsProperty])
    .filter((tutorialId) => !_.isEmpty(tutorialId))
    .flatten()
    .uniq()
    .value();
  return tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialsIds, userId, locale });
}

