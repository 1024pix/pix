'use strict';
import DatabaseBuilder from '../database-builder/database-builder';
import answersBuilder from './data/answers-builder';
import assessmentsBuilder from './data/assessments-builder';
import buildPixAileProfile from './data/pix-aile-profile-builder';
import { campaignsProBuilder } from './data/campaigns-pro-builder';
import { campaignsSupBuilder } from './data/campaigns-sup-builder';
import { campaignsScoBuilder } from './data/campaigns-sco-builder';
import { certificationCandidatesBuilder } from './data/certification/certification-candidates-builder';
import { badgeAcquisitionBuilder } from './data/certification/badge-acquisition-builder';
import { complementaryCertificationCourseResultsBuilder } from './data/certification/complementary-certification-course-results-builder';
import { certificationCentersBuilder } from './data/certification/certification-centers-builder';
import { certificationCenterInvitationsBuilder } from './data/certification/certification-center-invitations-builder';
import { certificationCoursesBuilder } from './data/certification/certification-courses-builder';
import certificationScoresBuilder from './data/certification/certification-scores-builder';
import { certificationSessionsBuilder } from './data/certification/certification-sessions-builder';
import { certificationUsersBuilder } from './data/certification/users';
import { certificationUserProfilesBuilder } from './data/certification/user-profiles-builder';
import certificationCenterMembershipsBuilder from './data/certification/certification-center-memberships-builder';
import { organizationsProBuilder } from './data/organizations-pro-builder';
import { organizationsScoBuilder } from './data/organizations-sco-builder';
import { organizationsSupBuilder } from './data/organizations-sup-builder';
import { organizationPlacesProBuilder } from './data/organization-places-pro-builder';
import { badgesBuilder } from './data/badges-builder';
import tagsBuilder from './data/tags-builder';
import { targetProfilesBuilder } from './data/target-profiles-builder';
import { usersBuilder } from './data/users-builder';
import pixAdminRolesBuilder from './data/pix-admin-roles-builder';
import stagesBuilder from './data/stages-builder';
import { certificationCpfCountryBuilder } from './data/certification/certification-cpf-country-builder';
import { certificationCpfCityBuilder } from './data/certification/certification-cpf-city-builder';
import { issueReportCategoriesBuilder } from './data/certification/issue-report-categories-builder';
import {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
} from '../../scripts/prod/generate-knowledge-element-snapshots-for-campaigns';
import computeParticipationsResults from '../../scripts/prod/compute-participation-results';
import poleEmploiSendingsBuilder from './data/pole-emploi-sendings-builder';
import { trainingBuilder } from './data/trainings-builder';
import { richTargetProfilesBuilder } from './data/learning-content/target-profiles-builder';
import { fillCampaignSkills } from './data/fill-campaign-skills';
import { addLastAssessmentResultCertificationCourse } from '../../scripts/certification/fill-last-assessment-result-certification-course-table';

export const seed = async (knex) => {
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
