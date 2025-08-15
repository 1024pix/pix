import { createCompanionAlert } from './create-companion-alert.js';
import { deneutralizeChallenge } from './deneutralize-challenge.js';
import { getNextChallenge } from './get-next-challenge.js';
import { getNextChallengeForV2Certification } from './get-next-challenge-for-v2-certification.js';
import { neutralizeChallenge } from './neutralize-challenge.js';
import { rescoreV2Certification } from './rescore-v2-certification.js';
import { rescoreV3Certification } from './rescore-v3-certification.js';
import { retrieveLastOrCreateCertificationCourse } from './retrieve-last-or-create-certification-course.js';
import { scoreCompletedV2Certification } from './score-completed-v2-certification.js';
import { scoreCompletedV3Certification } from './score-completed-v3-certification.js';
import { simulateFlashAssessmentScenario } from './simulate-flash-assessment-scenario.js';

const usecases = {
  createCompanionAlert,
  deneutralizeChallenge,
  getNextChallengeForV2Certification,
  getNextChallenge,
  neutralizeChallenge,
  rescoreV2Certification,
  rescoreV3Certification,
  retrieveLastOrCreateCertificationCourse,
  scoreCompletedV2Certification,
  scoreCompletedV3Certification,
  simulateFlashAssessmentScenario,
};

export { usecases };
