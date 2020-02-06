const targetProfileAdapter = require('../adapters/target-profile-adapter');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const BookshelfAssessment = require('../data/assessment');

const { NotFoundError } = require('../../domain/errors');
const Assessment = require('../../domain/models/Assessment');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Answer = require('../../domain/models/Answer');
const SmartPlacementAssessment = require('../../domain/models/SmartPlacementAssessment');
const KnowledgeElement = require('../../domain/models/KnowledgeElement');

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

  doesAssessmentBelongToUser(assessmentId, userId) {
    return BookshelfAssessment
      .where({ id: assessmentId, userId: userId })
      .fetch({
        require: true,
      })
      .then(() => Promise.resolve(true))
      .catch(() => Promise.resolve(false));
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

  const bookshelfCampaignParticipation = bookshelfAssessment
    .related('campaignParticipation');

  const bookshelfTargetProfile = bookshelfAssessment
    .related('campaignParticipation')
    .related('campaign')
    .related('targetProfile');

  const skillRecordIds = bookshelfTargetProfile
    .related('skillIds')
    .map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));

  return Promise
    .all([
      bookshelfAssessment, bookshelfTargetProfile, bookshelfCampaignParticipation, skillDatasource.findByRecordIds(skillRecordIds),
    ])
    .then(([bookshelfAssessment, bookshelfTargetProfile, bookshelfCampaignParticipation, associatedSkillAirtableDataObjects]) => {
      return { bookshelfAssessment, bookshelfTargetProfile, bookshelfCampaignParticipation, associatedSkillAirtableDataObjects };
    });
}

function _toDomain({ bookshelfAssessment, bookshelfTargetProfile, bookshelfCampaignParticipation, associatedSkillAirtableDataObjects }) {

  const targetProfile = targetProfileAdapter.fromDatasourceObjects({
    bookshelfTargetProfile,
    associatedSkillAirtableDataObjects,
  });

  const campaignParticipation = new CampaignParticipation(bookshelfCampaignParticipation.attributes);

  const answers = bookshelfAssessment
    .related('answers')
    .map((bookshelfAnswer) => new Answer(bookshelfAnswer.toJSON()));

  const knowledgeElements = bookshelfAssessment
    .related('knowledgeElements')
    .map((bookshelfKnowledgeElement) => {
      return new KnowledgeElement({
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
    createdAt: bookshelfAssessment.get('createdAt'),
    campaignParticipation,
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
