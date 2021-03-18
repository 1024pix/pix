const UserProfile = require('../../../../lib/domain/models/UserProfile');

const buildUserProfile = function buildUserProfile({
  userId,
  profileDate,
  targetProfileWithLearningContent,
  knowledgeElements,
  answerAndChallengeIdsByAnswerId,
} = {}) {
  return new UserProfile({
    userId,
    profileDate,
    targetProfileWithLearningContent,
    knowledgeElements,
    answerAndChallengeIdsByAnswerId,
  });
};

module.exports = buildUserProfile;
