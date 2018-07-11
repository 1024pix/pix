const BookshelfAssessment = require('../../infrastructure/data/assessment');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const Assessment = require('../../domain/models/Assessment');
const Skill = require('../../domain/models/Skill');
const SmartPlacementAnswer = require('../../domain/models/SmartPlacementAnswer');
const SmartPlacementAssessment = require('../../domain/models/SmartPlacementAssessment');
const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
// To delete once target-profile table is created
const targetProfileRepository = require('./target-profile-repository');
const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  get(assessmentId) {
    return BookshelfAssessment
      .where({ id: assessmentId })
      .fetch({
        require: true,
        withRelated: [
          'answers',
        ],
      })
      .then(checkIsSmartPlacement)
      .then(getChallengeAirtableDataObject)
      .then(toDomain)
      .catch(mapNotFoundErrorToDomainError(assessmentId));
  },
};

function checkIsSmartPlacement(bookshelfAssessment) {
  if (bookshelfAssessment.get('type') !== Assessment.types.SMARTPLACEMENT) {
    throw new NotFoundError(`Not found Smart Placement Assessment for ID ${bookshelfAssessment.get('id')}`);
  } else {
    return bookshelfAssessment;
  }
}

function getChallengeAirtableDataObject(bookshelfAssessment) {

  return Promise.all(
    bookshelfAssessment.related('answers')
      .map((answer) => challengeDatasource.get(answer.get('challengeId'))),
  )
    .then((challengeAirtableDataObjects) => {
      return { bookshelfAssessment, challengeAirtableDataObjects };
    });
}

function toDomain({ bookshelfAssessment, challengeAirtableDataObjects }) {

  // To delete once target-profile table is created. A repository should not call another repository.
  // use Bookshelf as datasource
  return targetProfileRepository.get('unusedForNowId')
    .then((targetProfile) => {

      const answers = bookshelfAssessment.related('answers').map((answer) => {
        return new SmartPlacementAnswer({
          id: answer.get('id'),
          result: answer.get('result'),
          challengeId: answer.get('challengeId'),
        });
      });

      const knowledgeElements = createKnowledgeElements({ answers, challengeAirtableDataObjects, targetProfile });

      return new SmartPlacementAssessment({
        id: bookshelfAssessment.get('id'),
        state: bookshelfAssessment.get('state'),
        userId: bookshelfAssessment.get('userId'),
        answers,
        knowledgeElements,
        targetProfile,
      });
    });
}

function createKnowledgeElements({ answers, challengeAirtableDataObjects, targetProfile }) {
  const knowledgeElementsWithoutInfered = answers.reduce((knowledgeElements, answer) => {

    const associatedChallengeAirtableDataObject = challengeAirtableDataObjects
      .find((challengeAirtableDataObject) => challengeAirtableDataObject.id === answer.challengeId);

    const validatedStatus = SmartPlacementKnowledgeElement.StatusType.VALIDATED;
    const invalidatedStatus = SmartPlacementKnowledgeElement.StatusType.INVALIDATED;

    const status = answer.isCorrect ? validatedStatus : invalidatedStatus;

    const knowledgeElementsToAdd = associatedChallengeAirtableDataObject.skills
      .map((skillName) => {
        return new SmartPlacementKnowledgeElement({
          id: -1,
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status,
          pixScore: 0,
          answerId: answer.id,
          skillId: skillName,
        });
      });

    return knowledgeElements.concat(knowledgeElementsToAdd);
  }, []);

  const validatedKnowledgeElements = knowledgeElementsWithoutInfered
    .filter((knowledgeElement) => knowledgeElement.isValidated);

  const skillsGroupedByTubeName = _.groupBy(targetProfile.skills, (skill) => skill.tubeName);

  let knowledgeElementsWithInfered = [].concat(knowledgeElementsWithoutInfered);

  // XXX: Extend the list of KnowledgeElements with inferred ones from the validated skills
  validatedKnowledgeElements.forEach((validatedKnowledgeElement) => {

    const validatedSkill = new Skill({ name: validatedKnowledgeElement.skillId });

    skillsGroupedByTubeName[validatedSkill.tubeName].forEach((skillToInfer) => {

      if (skillToInfer.difficulty <= validatedSkill.difficulty) {

        const knowledgeElementThatExistForThatSkill = knowledgeElementsWithInfered
          .find((knowledgeElement) => {
            const skillOfKnowledgeElement = new Skill({ name: knowledgeElement.skillId });
            return Skill.areEqual(skillToInfer, skillOfKnowledgeElement);
          });

        if (knowledgeElementThatExistForThatSkill === undefined) {

          const newKnowledgeElement = new SmartPlacementKnowledgeElement({
            id: -1,
            source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: validatedKnowledgeElement.answerId,
            skillId: skillToInfer.name,
          });

          knowledgeElementsWithInfered = knowledgeElementsWithInfered.concat(newKnowledgeElement);
        }
      }
    });
  });

  // XXX: Extend the list of KnowledgeElements with inferred ones from the validated skills
  const failedKnowledgeElements = knowledgeElementsWithoutInfered
    .filter((knowledgeElement) => !knowledgeElement.isValidated);

  failedKnowledgeElements.forEach((failedKnowledgeElement) => {

    const failedSkill = new Skill({ name: failedKnowledgeElement.skillId });

    skillsGroupedByTubeName[failedSkill.tubeName].forEach((skillToInfer) => {

      if (skillToInfer.difficulty >= failedSkill.difficulty) {

        const knowledgeElementThatExistForThatSkill = knowledgeElementsWithInfered
          .find((knowledgeElement) => {
            const skillOfKnowledgeElement = new Skill({ name: knowledgeElement.skillId });
            return Skill.areEqual(skillToInfer, skillOfKnowledgeElement);
          });

        if (knowledgeElementThatExistForThatSkill === undefined) {

          const newKnowledgeElement = new SmartPlacementKnowledgeElement({
            id: -1,
            source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
            status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
            pixScore: 0,
            answerId: failedKnowledgeElement.answerId,
            skillId: skillToInfer.name,
          });

          knowledgeElementsWithInfered = knowledgeElementsWithInfered.concat(newKnowledgeElement);
        }
      }
    });
  });

  return knowledgeElementsWithInfered;
}

function mapNotFoundErrorToDomainError(assessmentId) {
  return (err) => {
    if (err instanceof BookshelfAssessment.NotFoundError) {
      throw new NotFoundError(`Not found Smart Placement Assessment for ID ${assessmentId}`);
    } else {
      throw err;
    }
  };
}
