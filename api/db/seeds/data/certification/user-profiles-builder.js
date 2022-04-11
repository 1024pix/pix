const _ = require('lodash');
const {
  CERTIF_SUCCESS_USER_ID, CERTIF_FAILURE_USER_ID,
  CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID, CERTIF_SCO_STUDENT_ID, CERTIF_REGULAR_USER_WITH_TIMED_CHALLENGE_ID,
  CERTIF_DROIT_USER5_ID, CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID, CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID,
} = require('./users');
const {
  STRONG_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  WEAK_CERTIFIABLE_WITH_TIMED_CHALLENGE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  PIXPLUS_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  PIX_EDU_FORMATION_INITIALE_AVANCE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  PIX_EDU_FORMATION_CONTINUE_FORMATEUR_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
} = require('./certification-data');
const { SCO_FOREIGNER_USER_ID, SCO_FRENCH_USER_ID } = require('../organizations-sco-builder');

function certificationUserProfilesBuilder({ databaseBuilder }) {
  // Both have a STRONG certifiable profile
  const createdAt = new Date('2019-12-31T00:00:00Z');
  const updatedAt = createdAt;
  const assessmentIdForSuccess = databaseBuilder.factory.buildAssessment({ userId: CERTIF_SUCCESS_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  const assessmentIdForFailure = databaseBuilder.factory.buildAssessment({ userId: CERTIF_FAILURE_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each(STRONG_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, (data) => {
    let answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForSuccess, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_SUCCESS_USER_ID, assessmentId: assessmentIdForSuccess });
    answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForFailure, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_FAILURE_USER_ID, assessmentId: assessmentIdForFailure });
  });

  const assessmentIdForPixPlus = databaseBuilder.factory.buildAssessment({ userId: CERTIF_DROIT_USER5_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each([...PIXPLUS_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, ...STRONG_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS], (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForPixPlus, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_DROIT_USER5_ID, assessmentId: assessmentIdForPixPlus });
  });

  // The rest of them just have the minimum requirements to be certifiable
  _.each([SCO_FRENCH_USER_ID, SCO_FOREIGNER_USER_ID, CERTIF_REGULAR_USER1_ID, CERTIF_REGULAR_USER2_ID, CERTIF_REGULAR_USER3_ID, CERTIF_REGULAR_USER4_ID, CERTIF_REGULAR_USER5_ID, CERTIF_SCO_STUDENT_ID], (userId) => {
    const assessmentId = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
    _.each(WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, (data) => {
      const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId, value: 'Dummy value' }).id;
      databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId, assessmentId });
    });
  });

  // A user having a timed challenge (for certification testing purpose)
  const assessmentId = databaseBuilder.factory.buildAssessment({ userId: CERTIF_REGULAR_USER_WITH_TIMED_CHALLENGE_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each(WEAK_CERTIFIABLE_WITH_TIMED_CHALLENGE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_REGULAR_USER_WITH_TIMED_CHALLENGE_ID, assessmentId });
  });

  const assessmentIdForPixEduFormationInitiale2ndDegre = databaseBuilder.factory.buildAssessment({ userId: CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each([...PIX_EDU_FORMATION_INITIALE_AVANCE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, ...WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS], (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForPixEduFormationInitiale2ndDegre, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID, assessmentId: assessmentIdForPixEduFormationInitiale2ndDegre });
  });

  const assessmentIdForPixEduFormationInitiale1erDegre = databaseBuilder.factory.buildAssessment({ userId: CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each([...PIX_EDU_FORMATION_INITIALE_AVANCE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, ...WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS], (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForPixEduFormationInitiale1erDegre, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID, assessmentId: assessmentIdForPixEduFormationInitiale1erDegre });
  });

  const assessmentIdForPixEduFormationContinue2ndDegre = databaseBuilder.factory.buildAssessment({ userId: CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each([...PIX_EDU_FORMATION_CONTINUE_FORMATEUR_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, ...WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS], (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForPixEduFormationContinue2ndDegre, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID, assessmentId: assessmentIdForPixEduFormationContinue2ndDegre });
  });

  const assessmentIdForPixEduFormationContinue1erDegre = databaseBuilder.factory.buildAssessment({ userId: CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID, type: 'COMPETENCE_EVALUATION', state: 'completed' }).id;
  _.each([...PIX_EDU_FORMATION_CONTINUE_FORMATEUR_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, ...WEAK_CERTIFIABLE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS], (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({ ...data, createdAt, updatedAt, assessmentId: assessmentIdForPixEduFormationContinue1erDegre, value: 'Dummy value' }).id;
    databaseBuilder.factory.buildKnowledgeElement({ ...data, createdAt, answerId, userId: CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID, assessmentId: assessmentIdForPixEduFormationContinue1erDegre });
  });
}

module.exports = {
  certificationUserProfilesBuilder,
};
