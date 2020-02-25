const _ = require('lodash');
const {
  CERTIF_SUCCESS_USER_ID, CERTIF_FAILURE_USER_ID,
  CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID,
} = require('./users');
const {
  STRONG_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
} = require('./certification-data');

function certificationUserProfilesBuilder({ databaseBuilder }) {
  // Both have a STRONG certifiable profile
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

  // The rest of them just have the minimum requirements to be certifiable
  _.each([CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID, CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID], (userId) => {
    const assessmentId = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
    _.each(WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, (data) => {
      const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId, value: 'Dummy value' }).id;
      databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId ,assessmentId });
    });
  });
}

module.exports = certificationUserProfilesBuilder;
