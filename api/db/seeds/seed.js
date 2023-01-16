'use strict';
const DatabaseBuilder = require('../database-builder/database-builder');

const answersBuilder = require('./data/answers-builder');
const assessmentsBuilder = require('./data/assessments-builder');
const buildPixAileProfile = require('./data/pix-aile-profile-builder');
const { campaignsProBuilder } = require('./data/campaigns-pro-builder');
const { campaignsSupBuilder } = require('./data/campaigns-sup-builder');
const { campaignsScoBuilder } = require('./data/campaigns-sco-builder');
const { certificationCandidatesBuilder } = require('./data/certification/certification-candidates-builder');
const { badgeAcquisitionBuilder } = require('./data/certification/badge-acquisition-builder');
const {
  complementaryCertificationCourseResultsBuilder,
} = require('./data/certification/complementary-certification-course-results-builder');
const { certificationCentersBuilder } = require('./data/certification/certification-centers-builder');
const {
  certificationCenterInvitationsBuilder,
} = require('./data/certification/certification-center-invitations-builder');
const { certificationCoursesBuilder } = require('./data/certification/certification-courses-builder');
const certificationScoresBuilder = require('./data/certification/certification-scores-builder');
const { certificationSessionsBuilder } = require('./data/certification/certification-sessions-builder');
const { certificationUsersBuilder } = require('./data/certification/users');
const { certificationUserProfilesBuilder } = require('./data/certification/user-profiles-builder');
const certificationCenterMembershipsBuilder = require('./data/certification/certification-center-memberships-builder');
const { organizationsProBuilder } = require('./data/organizations-pro-builder');
const { organizationsScoBuilder } = require('./data/organizations-sco-builder');
const { organizationsSupBuilder } = require('./data/organizations-sup-builder');
const { organizationPlacesProBuilder } = require('./data/organization-places-pro-builder');
const { badgesBuilder } = require('./data/badges-builder');
const tagsBuilder = require('./data/tags-builder');
const { targetProfilesBuilder } = require('./data/target-profiles-builder');
const { usersBuilder } = require('./data/users-builder');
const pixAdminRolesBuilder = require('./data/pix-admin-roles-builder');
const stagesBuilder = require('./data/stages-builder');
const { certificationCpfCountryBuilder } = require('./data/certification/certification-cpf-country-builder');
const { certificationCpfCityBuilder } = require('./data/certification/certification-cpf-city-builder');
const { issueReportCategoriesBuilder } = require('./data/certification/issue-report-categories-builder');
const {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
} = require('../../scripts/prod/generate-knowledge-element-snapshots-for-campaigns');
const computeParticipationsResults = require('../../scripts/prod/compute-participation-results');

const poleEmploiSendingsBuilder = require('./data/pole-emploi-sendings-builder');
const { trainingBuilder } = require('./data/trainings-builder');
const { richTargetProfilesBuilder } = require('./data/learning-content/target-profiles-builder');
const { fillCampaignSkills } = require('./data/fill-campaign-skills');
const {
  addLastAssessmentResultCertificationCourse,
} = require('../../scripts/certification/fill-last-assessment-result-certification-course-table');

exports.seed = async (knex) => {
  const databaseBuilder = new DatabaseBuilder({ knex });

  // Users
  usersBuilder({ databaseBuilder });
  pixAdminRolesBuilder({ databaseBuilder });

  // Organizations
  tagsBuilder({ databaseBuilder });

  organizationsProBuilder({ databaseBuilder });
  organizationPlacesProBuilder({ databaseBuilder });

  organizationsScoBuilder({ databaseBuilder });

  organizationsSupBuilder({ databaseBuilder });

  // Target Profiles
  targetProfilesBuilder({ databaseBuilder });
  badgesBuilder({ databaseBuilder });
  stagesBuilder({ databaseBuilder });

  // Trainings
  trainingBuilder({ databaseBuilder });

  // Certifications
  certificationCentersBuilder({ databaseBuilder });
  certificationCenterInvitationsBuilder({ databaseBuilder });
  certificationUsersBuilder({ databaseBuilder });
  certificationCenterMembershipsBuilder({ databaseBuilder });
  await certificationUserProfilesBuilder({ databaseBuilder });
  certificationSessionsBuilder({ databaseBuilder });
  certificationCandidatesBuilder({ databaseBuilder });
  await certificationCoursesBuilder({ databaseBuilder });
  certificationScoresBuilder({ databaseBuilder });
  badgeAcquisitionBuilder({ databaseBuilder });
  complementaryCertificationCourseResultsBuilder({ databaseBuilder });
  certificationCpfCountryBuilder({ databaseBuilder });
  certificationCpfCityBuilder({ databaseBuilder });
  issueReportCategoriesBuilder({ databaseBuilder });

  // Éléments de parcours
  campaignsProBuilder({ databaseBuilder });
  campaignsSupBuilder({ databaseBuilder });
  campaignsScoBuilder({ databaseBuilder });
  assessmentsBuilder({ databaseBuilder });
  answersBuilder({ databaseBuilder });

  // Éléments de parcours pour l'utilisateur Pix Aile
  buildPixAileProfile({ databaseBuilder });

  // Création d'envois pole emploi
  poleEmploiSendingsBuilder({ databaseBuilder });

  await richTargetProfilesBuilder({ databaseBuilder });

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
  await fillCampaignSkills();
  await addLastAssessmentResultCertificationCourse();
  const campaignParticipationData = await getEligibleCampaignParticipations(50000);
  await generateKnowledgeElementSnapshots(campaignParticipationData, 1);
  await computeParticipationsResults(10, false);
};
