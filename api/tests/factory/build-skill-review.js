const buildAssessment = require('./build-assessment');
const TargetProfile = require('../../lib/domain/models/TargetProfile');
const SkillReview = require('../../lib/domain/models/SkillReview');

module.exports = function buildSkillReview({
  assessment = buildAssessment(),
  targetProfile = TargetProfile.TEST_PROFIL,
} = {}) {
  return new SkillReview({ assessment, targetProfile });
};
