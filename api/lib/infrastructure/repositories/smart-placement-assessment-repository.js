const targetProfileAdapter = require('../adapters/target-profile-adapter');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const BookshelfAssessment = require('../data/assessment');

const { NotFoundError } = require('../../domain/errors');
const Assessment = require('../../domain/models/Assessment');
const SmartPlacementAnswer = require('../../domain/models/SmartPlacementAnswer');
const SmartPlacementAssessment = require('../../domain/models/SmartPlacementAssessment');
const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');

module.exports = {

  get(assessmentId) {
    return BookshelfAssessment
      .where({ id: assessmentId })
      .fetch({
        require: true,
        withRelated: [
          'answers',
          'knowledgeElements',
          'campaignParticipation',
          'campaignParticipation.campaign',
          'campaignParticipation.campaign.targetProfile',
          'campaignParticipation.campaign.targetProfile.skillIds',
        ],
      })
      .then(_checkIsSmartPlacement)
      .then(_fetchAllDependencies)
      .then(_toDomain)
      .catch(_mapNotFoundErrorToDomainError(assessmentId));
  },
};

function _checkIsSmartPlacement(bookshelfAssessment) {
  if (bookshelfAssessment.get('type') !== Assessment.types.SMARTPLACEMENT) {
    throw new NotFoundError(`Not found Smart Placement Assessment for ID ${bookshelfAssessment.get('id')}`);
  } else {
    return bookshelfAssessment;
  }
}

function _fetchAllDependencies(bookshelfAssessment) {

  const bookshelfTargetProfile = bookshelfAssessment
    .related('campaignParticipation')
    .related('campaign')
    .related('targetProfile');

  const skillRecordIds = bookshelfTargetProfile
    .related('skillIds')
    .map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));

  return Promise
    .all([
      bookshelfAssessment, bookshelfTargetProfile, skillDatasource.findByRecordIds(skillRecordIds),
    ])
    .then(([bookshelfAssessment, bookshelfTargetProfile, associatedSkillAirtableDataObjects]) => {
      return { bookshelfAssessment, bookshelfTargetProfile, associatedSkillAirtableDataObjects };
    });
}

function _toDomain({ bookshelfAssessment, bookshelfTargetProfile, associatedSkillAirtableDataObjects }) {

  const targetProfile = targetProfileAdapter.fromDatasourceObjects({
    bookshelfTargetProfile,
    associatedSkillAirtableDataObjects,
  });

  const answers = bookshelfAssessment
    .related('answers')
    .map((bookshelfAnswer) => {
      return new SmartPlacementAnswer({
        id: bookshelfAnswer.get('id'),
        result: bookshelfAnswer.get('result'),
        challengeId: bookshelfAnswer.get('challengeId'),
      });
    });

  const knowledgeElements = bookshelfAssessment
    .related('knowledgeElements')
    .map((bookshelfKnowledgeElement) => {
      return new SmartPlacementKnowledgeElement({
        id: bookshelfKnowledgeElement.get('id'),
        source: bookshelfKnowledgeElement.get('source'),
        status: bookshelfKnowledgeElement.get('status'),
        pixScore: bookshelfKnowledgeElement.get('pixScore'),
        answerId: bookshelfKnowledgeElement.get('answerId'),
        assessmentId: bookshelfKnowledgeElement.get('assessmentId'),
        skillId: bookshelfKnowledgeElement.get('skillId'),
      });
    });

  return new SmartPlacementAssessment({
    id: bookshelfAssessment.get('id'),
    state: bookshelfAssessment.get('state'),
    userId: bookshelfAssessment.get('userId'),
    answers,
    knowledgeElements,
    targetProfile,
  });
}

function _mapNotFoundErrorToDomainError(assessmentId) {
  return (err) => {
    if (err instanceof BookshelfAssessment.NotFoundError) {
      throw new NotFoundError(`Not found Smart Placement Assessment for ID ${assessmentId}`);
    } else {
      throw err;
    }
  };
}
