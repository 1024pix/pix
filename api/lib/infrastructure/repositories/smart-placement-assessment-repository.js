const BookshelfAssessment = require('../../infrastructure/data/assessment');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const SmartPlacementAnswer = require('../../domain/models/SmartPlacementAnswer');
const SmartPlacementAssessment = require('../../domain/models/SmartPlacementAssessment');
const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
// To delete once target-profile table is created
const targetProfileRepository = require('./target-profile-repository');
const { NotFoundError } = require('../../domain/errors');

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

      const knowledgeElements = answers.reduce((knowledgeElements, answer) => {

        const associatedChallengeAirtableDataObject = challengeAirtableDataObjects
          .find((challengeAirtableDataObject) => challengeAirtableDataObject.id === answer.challengeId);

        const validatedStatus = SmartPlacementKnowledgeElement.StatusType.VALIDATED;
        const invalidatedStatus = SmartPlacementKnowledgeElement.StatusType.INVALIDATED;

        const status = answer.isCorrect ? validatedStatus : invalidatedStatus;

        const knowledgeElementsToAdd = associatedChallengeAirtableDataObject.skills
          .map((skillName) => {
            return new SmartPlacementKnowledgeElement({
              id: -1,
              // TODO: for now, has to be calculated one day. INFERED skills are not calculated
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status,
              pixScore: 0,
              answerId: answer.id,
              skillId: skillName,
            });
          });

        return knowledgeElements.concat(knowledgeElementsToAdd);
      }, []);

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
      .then(getChallengeAirtableDataObject)
      .then(toDomain)
      .catch(err => {
        if (err instanceof BookshelfAssessment.NotFoundError) {
          throw new NotFoundError(`Not found Assessment for ID ${assessmentId}`);
        } else {
          throw err;
        }
      });
  },
};
