// LionelB: on appelle l'api directement plutot que depuis le repo campaign pour éviter une dépendance cyclique
import * as combinedCourseApi from '../../../../quest/application/api/combined-course-api.js';
import { CampaignBelongsToCombinedCourseError } from '../../domain/errors.js';

const execute = async function ({ campaignId, dependencies = { combinedCourseApi } }) {
  if ((await dependencies.combinedCourseApi.getByCampaignId(campaignId)) !== null) {
    throw new CampaignBelongsToCombinedCourseError();
  }
};

export { execute };
