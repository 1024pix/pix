const authenticateUser = require('./authenticate-user');
const createCampaign = require('./create-campaign');
const createAssessmentResultForCompletedCertification = require('./create-assessment-result-for-completed-certification');
const createUser = require('./create-user');
const findCompletedUserCertifications = require('./find-completed-user-certifications');
const findUserAssessmentsByFilters = require('./find-user-assessments-by-filters');
const getCorrectionForAnswerWhenAssessmentEnded = require('./get-correction-for-answer-when-assessment-ended');
const getNextChallengeForCertification = require('./get-next-challenge-for-certification');
const getNextChallengeForDemo = require('./get-next-challenge-for-demo');
const getNextChallengeForPlacement = require('./get-next-challenge-for-placement');
const getNextChallengeForPreview = require('./get-next-challenge-for-preview');
const getNextChallengeForSmartPlacement = require('./get-next-challenge-for-smart-placement');
const getSkillReview = require('./get-skill-review');
const getUserCertification = require('./get-user-certification');
const getUserCertificationWithResultTree = require('./get-user-certification-with-result-tree');
const getUserWithOrganizationAccesses = require('./get-user-with-organization-accesses');
const preloadCacheEntries = require('./preload-cache-entries');
const removeAllCacheEntries = require('./remove-all-cache-entries');
const removeCacheEntry = require('./remove-cache-entry');
const saveAnswerAndCreateAssociatedKnowledgeElements = require('./save-answer-and-create-associated-knowledge-elements');
const updateCertification = require('./update-certification');

module.exports = {
  authenticateUser,
  createCampaign,
  createAssessmentResultForCompletedCertification,
  createUser,
  findCompletedUserCertifications,
  findUserAssessmentsByFilters,
  getCorrectionForAnswerWhenAssessmentEnded,
  getNextChallengeForCertification,
  getNextChallengeForDemo,
  getNextChallengeForPlacement,
  getNextChallengeForPreview,
  getNextChallengeForSmartPlacement,
  getSkillReview,
  getUserCertification,
  getUserCertificationWithResultTree,
  getUserWithOrganizationAccesses,
  preloadCacheEntries,
  removeAllCacheEntries,
  removeCacheEntry,
  saveAnswerAndCreateAssociatedKnowledgeElements,
  updateCertification,
};
