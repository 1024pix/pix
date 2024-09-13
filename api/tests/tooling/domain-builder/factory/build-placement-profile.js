import _ from 'lodash';

import { PlacementProfile } from '../../../../src/shared/domain/models/index.js';
import { buildUserCompetence } from './build-user-competence.js';

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

buildPlacementProfile.buildForCompetences = function buildForCompetences({ profileDate, userId, competencesData }) {
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

buildPlacementProfile.buildCertifiable = function buildCertifiable({ profileDate, userId }) {
  const userCompetences = Array(5)
    .fill()
    .map((_, index) => {
      return buildUserCompetence({
        id: index,
        index,
        name: `competence_${index}`,
        pixScore: 10_000,
        estimatedLevel: 7,
      });
    });
  return new PlacementProfile({ profileDate, userId, userCompetences });
};

export { buildPlacementProfile };
