import _ from 'lodash';
import bluebird from 'bluebird';

import {
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILURE_USER_ID,
  CERTIF_REGULAR_USER1_ID,
  CERTIF_REGULAR_USER2_ID,
  CERTIF_REGULAR_USER3_ID,
  CERTIF_REGULAR_USER4_ID,
  CERTIF_REGULAR_USER5_ID,
  CERTIF_SCO_STUDENT_ID,
  CERTIF_REGULAR_USER_WITH_TIMED_CHALLENGE_ID,
  CERTIF_DROIT_USER5_ID,
  CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID,
} from './users';

import { makeUserPixCertifiable, makeUserPixDroitCertifiable } from './tooling';

import {
  WEAK_CERTIFIABLE_WITH_TIMED_CHALLENGE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  PIX_EDU_FORMATION_INITIALE_AVANCE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
  PIX_EDU_FORMATION_CONTINUE_FORMATEUR_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
} from './certification-data';

import { SCO_FOREIGNER_USER_ID, SCO_FRENCH_USER_ID } from '../organizations-sco-builder';

async function certificationUserProfilesBuilder({ databaseBuilder }) {
  const createdAt = new Date('2019-12-31T00:00:00Z');
  const updatedAt = createdAt;

  // STRONG Pix Profile
  await makeUserPixCertifiable({
    userId: CERTIF_SUCCESS_USER_ID,
    databaseBuilder,
    countCertifiableCompetences: 16,
    levelOnEachCompetence: 6,
  });
  await makeUserPixCertifiable({
    userId: CERTIF_FAILURE_USER_ID,
    databaseBuilder,
    countCertifiableCompetences: 16,
    levelOnEachCompetence: 6,
  });

  // Minimal Pix Profile
  await bluebird.mapSeries(
    [
      SCO_FRENCH_USER_ID,
      SCO_FOREIGNER_USER_ID,
      CERTIF_REGULAR_USER1_ID,
      CERTIF_REGULAR_USER2_ID,
      CERTIF_REGULAR_USER3_ID,
      CERTIF_REGULAR_USER4_ID,
      CERTIF_REGULAR_USER5_ID,
      CERTIF_SCO_STUDENT_ID,
    ],
    (userId) => {
      return makeUserPixCertifiable({
        userId,
        databaseBuilder,
        countCertifiableCompetences: 5,
        levelOnEachCompetence: 1,
      });
    }
  );

  // Pix+ Droit
  await makeUserPixCertifiable({
    userId: CERTIF_DROIT_USER5_ID,
    databaseBuilder,
    countCertifiableCompetences: 16,
    levelOnEachCompetence: 3,
  });
  await makeUserPixDroitCertifiable({ userId: CERTIF_DROIT_USER5_ID, databaseBuilder });

  // Minimal Pix Profile with timed challenge
  const assessmentId = databaseBuilder.factory.buildAssessment({
    userId: CERTIF_REGULAR_USER_WITH_TIMED_CHALLENGE_ID,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  _.each(
    WEAK_CERTIFIABLE_WITH_TIMED_CHALLENGE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
    (data) => {
      const answerId = databaseBuilder.factory.buildAnswer({
        ...data,
        createdAt,
        updatedAt,
        assessmentId,
        value: 'Dummy value',
      }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        ...data,
        createdAt,
        answerId,
        userId: CERTIF_REGULAR_USER_WITH_TIMED_CHALLENGE_ID,
        assessmentId,
      });
    }
  );

  // Pix+ EDU
  await makeUserPixCertifiable({
    userId: CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID,
    databaseBuilder,
    countCertifiableCompetences: 5,
    levelOnEachCompetence: 1,
  });
  const assessmentIdForPixEduFormationInitiale2ndDegre = databaseBuilder.factory.buildAssessment({
    userId: CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  _.each(PIX_EDU_FORMATION_INITIALE_AVANCE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({
      ...data,
      createdAt,
      updatedAt,
      assessmentId: assessmentIdForPixEduFormationInitiale2ndDegre,
      value: 'Dummy value',
    }).id;
    databaseBuilder.factory.buildKnowledgeElement({
      ...data,
      createdAt,
      answerId,
      userId: CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID,
      assessmentId: assessmentIdForPixEduFormationInitiale2ndDegre,
    });
  });

  await makeUserPixCertifiable({
    userId: CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID,
    databaseBuilder,
    countCertifiableCompetences: 5,
    levelOnEachCompetence: 1,
  });
  const assessmentIdForPixEduFormationInitiale1erDegre = databaseBuilder.factory.buildAssessment({
    userId: CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  _.each(PIX_EDU_FORMATION_INITIALE_AVANCE_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS, (data) => {
    const answerId = databaseBuilder.factory.buildAnswer({
      ...data,
      createdAt,
      updatedAt,
      assessmentId: assessmentIdForPixEduFormationInitiale1erDegre,
      value: 'Dummy value',
    }).id;
    databaseBuilder.factory.buildKnowledgeElement({
      ...data,
      createdAt,
      answerId,
      userId: CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID,
      assessmentId: assessmentIdForPixEduFormationInitiale1erDegre,
    });
  });

  await makeUserPixCertifiable({
    userId: CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID,
    databaseBuilder,
    countCertifiableCompetences: 5,
    levelOnEachCompetence: 1,
  });
  const assessmentIdForPixEduFormationContinue2ndDegre = databaseBuilder.factory.buildAssessment({
    userId: CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  _.each(
    PIX_EDU_FORMATION_CONTINUE_FORMATEUR_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
    (data) => {
      const answerId = databaseBuilder.factory.buildAnswer({
        ...data,
        createdAt,
        updatedAt,
        assessmentId: assessmentIdForPixEduFormationContinue2ndDegre,
        value: 'Dummy value',
      }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        ...data,
        createdAt,
        answerId,
        userId: CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID,
        assessmentId: assessmentIdForPixEduFormationContinue2ndDegre,
      });
    }
  );

  await makeUserPixCertifiable({
    userId: CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID,
    databaseBuilder,
    countCertifiableCompetences: 5,
    levelOnEachCompetence: 1,
  });
  const assessmentIdForPixEduFormationContinue1erDegre = databaseBuilder.factory.buildAssessment({
    userId: CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  _.each(
    PIX_EDU_FORMATION_CONTINUE_FORMATEUR_PROFILE_DATA_OBJECTS_FOR_BUILDING_ANSWERS_AND_KNOWLEDGE_ELEMENTS,
    (data) => {
      const answerId = databaseBuilder.factory.buildAnswer({
        ...data,
        createdAt,
        updatedAt,
        assessmentId: assessmentIdForPixEduFormationContinue1erDegre,
        value: 'Dummy value',
      }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        ...data,
        createdAt,
        answerId,
        userId: CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID,
        assessmentId: assessmentIdForPixEduFormationContinue1erDegre,
      });
    }
  );
}

export default {
  certificationUserProfilesBuilder,
};
