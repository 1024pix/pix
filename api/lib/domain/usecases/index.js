const authenticateUser = require('./authenticate-user');
const createUser = require('./create-user');
const findCompletedUserCertifications = require('./find-completed-user-certifications');
const getCorrectionForAnswerWhenAssessmentEnded = require('./get-correction-for-answer-when-assessment-ended');
const getNextChallengeForCertification = require('./get-next-challenge-for-certification');
const getNextChallengeForDemo = require('./get-next-challenge-for-demo');
const getNextChallengeForPlacement = require('./get-next-challenge-for-placement');
const getNextChallengeForPreview = require('./get-next-challenge-for-preview');
const getNextChallengeForSmartPlacement = require('./get-next-challenge-for-smart-placement');
const getUserCertification = require('./get-user-certification');
const getUser = require('./get-user');
const getUserCertificationWithResultTree = require('./get-user-certification-with-result-tree');
const preloadCacheEntries = require('./preload-cache-entries');
const removeAllCacheEntries = require('./remove-all-cache-entries');
const removeCacheEntry = require('./remove-cache-entry');
const updateCertification = require('./update-certification');

module.exports = {
  // Thx to list the use cases in alphabetical order :)
  authenticateUser,
  createUser,
  findCompletedUserCertifications,
  getCorrectionForAnswerWhenAssessmentEnded,
  getNextChallengeForCertification,
  getNextChallengeForDemo,
  getNextChallengeForPlacement,
  getNextChallengeForPreview,
  getNextChallengeForSmartPlacement,
  getUser,
  getUserCertification,
  getUserCertificationWithResultTree,
  preloadCacheEntries,
  removeAllCacheEntries,
  removeCacheEntry,
  updateCertification,
};
