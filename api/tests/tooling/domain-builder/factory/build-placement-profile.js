const _ = require('lodash');
const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');
const buildUserCompetence = require('./build-user-competence');

const buildPlacementProfile = function buildPlacementProfile({
  profileDate = new Date('2020-01-01'),
  userId = 123,
  userCompetences = [buildUserCompetence()],
} = {}) {
  return new PlacementProfile({
    profileDate,
    userId,
    userCompetences,
  });
};

buildPlacementProfile.buildForCompetences = function buildForCompetences({
  profileDate,
  userId,
  competencesData, // [{competence, level, score}, ...]
}) {
  const userCompetences = _.map(competencesData, (competenceData) => {
    return buildUserCompetence({
      id: competenceData.id,
      index: competenceData.index,
      name: competenceData.name,
      pixScore: competenceData.score,
      estimatedLevel: competenceData.level,
    });
  });

  return buildPlacementProfile({
    profileDate,
    userId,
    userCompetences,
  });
};

module.exports = buildPlacementProfile;
