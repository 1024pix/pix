'use strict';
import { DatabaseBuilder } from '../database-builder/database-builder.js';
import { featuresBuilder } from './data/feature/feature-builder.js';
import { answersBuilder } from './data/answers-builder.js';
import { assessmentsBuilder } from './data/assessments-builder.js';
import { buildPixAileProfilev2 as buildPixAileProfile } from './data/pix-aile-profile-builder.js';
import { campaignsProBuilder } from './data/campaigns-pro-builder.js';
import { campaignsSupBuilder } from './data/campaigns-sup-builder.js';
import { campaignsScoBuilder } from './data/campaigns-sco-builder.js';
import { certificationCandidatesBuilder } from './data/certification/certification-candidates-builder.js';
import { badgeAcquisitionBuilder } from './data/certification/badge-acquisition-builder.js';
import { complementaryCertificationCourseResultsBuilder } from './data/certification/complementary-certification-course-results-builder.js';
import { certificationCentersBuilder } from './data/certification/certification-centers-builder.js';
import { certificationCenterInvitationsBuilder } from './data/certification/certification-center-invitations-builder.js';
import { certificationCoursesBuilder } from './data/certification/certification-courses-builder.js';
import { certificationScoresBuilder } from './data/certification/certification-scores-builder.js';
import { certificationSessionsBuilder } from './data/certification/certification-sessions-builder.js';
import { certificationUsersBuilder } from './data/certification/users.js';
import { certificationUserProfilesBuilder } from './data/certification/user-profiles-builder.js';
import { certificationCenterMembershipsBuilder } from './data/certification/certification-center-memberships-builder.js';
import { organizationsProBuilder } from './data/organizations-pro-builder.js';
import { organizationsScoBuilder } from './data/organizations-sco-builder.js';
import { organizationsSupBuilder } from './data/organizations-sup-builder.js';
import { organizationPlacesProBuilder } from './data/organization-places-pro-builder.js';
import { badgesBuilder } from './data/badges-builder.js';
import { targetProfilesBuilder } from './data/target-profiles-builder.js';
import { usersBuilder } from './data/users-builder.js';
import { userLoginsBuilder } from './data/user-logins-builder.js';
import { pixAdminRolesBuilder } from './data/pix-admin-roles-builder.js';
import { stagesBuilder } from './data/stages-builder.js';
import { certificationCpfCountryBuilder } from './data/certification/certification-cpf-country-builder.js';
import { certificationCpfCityBuilder } from './data/certification/certification-cpf-city-builder.js';
import { issueReportCategoriesBuilder } from './data/certification/issue-report-categories-builder.js';
import {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
} from '../../scripts/prod/generate-knowledge-element-snapshots-for-campaigns.js';
import { computeParticipantResultsShared as computeParticipationsResults } from '../../scripts/prod/compute-participation-results.js';
import { poleEmploiSendingsBuilder } from './data/pole-emploi-sendings-builder.js';
import { trainingBuilder } from './data/trainings-builder.js';
import { commonBuilder } from './data/common/common-builder.js';
import { teamContenuDataBuilder } from './data/team-contenu/data-builder.js';
import { teamCertificationDataBuilder } from './data/team-certification/data-builder.js';
import { fillCampaignSkills } from './data/fill-campaign-skills.js';
import { addLastAssessmentResultCertificationCourse } from '../../scripts/certification/fill-last-assessment-result-certification-course-table.js';

const seed = async function (knex) {
  const databaseBuilder = new DatabaseBuilder({ knex });
  commonBuilder({ databaseBuilder });

  // Feature list
  featuresBuilder({ databaseBuilder });

  // Users
  usersBuilder({ databaseBuilder });
  pixAdminRolesBuilder({ databaseBuilder });

  // Organizations
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

  userLoginsBuilder({ databaseBuilder });

  await teamContenuDataBuilder({ databaseBuilder });
  await teamCertificationDataBuilder({ databaseBuilder });

  await databaseBuilder.commit();
  await databaseBuilder.fixSequences();
  await fillCampaignSkills();
  await addLastAssessmentResultCertificationCourse();
  const campaignParticipationData = await getEligibleCampaignParticipations(50000);
  await generateKnowledgeElementSnapshots(campaignParticipationData, 1);
  await computeParticipationsResults(10, false);
};

export { seed };
