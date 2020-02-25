const _ = require('lodash');
const { CERTIF_SUCCESS_USER_ID, CERTIF_FAILURE_USER_ID } = require('./users');
const { STRONG_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS } = require('./certification-data');

function certificationUserProfilesBuilder({ databaseBuilder }) {
  // Both have a certifiable profile
  const createdAt = new Date('2019-12-31T00:00:00Z');
  const updatedAt = createdAt;
  const assessmentIdForSuccess = databaseBuilder.factory.buildAssessment({ userId: CERTIF_SUCCESS_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  const assessmentIdForFailure = databaseBuilder.factory.buildAssessment({ userId: CERTIF_FAILURE_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each(STRONG_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, (data) => {
    let answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForSuccess, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_SUCCESS_USER_ID ,assessmentId: assessmentIdForSuccess });
    answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForFailure, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_FAILURE_USER_ID ,assessmentId: assessmentIdForFailure });
  });
}

module.exports = certificationUserProfilesBuilder;
