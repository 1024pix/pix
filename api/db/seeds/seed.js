'use strict';
const bluebird = require('bluebird');
const DatabaseBuilder = require('../database-builder/database-builder');

const answersBuilder = require('./data/answers-builder');
const assessmentsBuilder = require('./data/assessments-builder');
const buildPixAileProfile = require('./data/pix-aile-profile-builder');
const { campaignsProBuilder } = require('./data/campaigns-pro-builder');
const { campaignsSupBuilder } = require('./data/campaigns-sup-builder');
const { campaignsScoBuilder } = require('./data/campaigns-sco-builder');
const { certificationCandidatesBuilder } = require('./data/certification/certification-candidates-builder');
const { badgeAcquisitionBuilder } = require('./data/certification/badge-acquisition-builder');
const { partnerCertificationBuilder } = require('./data/certification/partner-certification-builder');
const { certificationCentersBuilder } = require('./data/certification/certification-centers-builder');
const { certificationCoursesBuilder } = require('./data/certification/certification-courses-builder');
const certificationScoresBuilder = require('./data/certification/certification-scores-builder');
const { certificationSessionsBuilder } = require('./data/certification/certification-sessions-builder');
const { certificationUsersBuilder } = require('./data/certification/users');
const { certificationUserProfilesBuilder } = require('./data/certification/user-profiles-builder');
const certificationCenterMembershipsBuilder = require('./data/certification/certification-center-memberships-builder');
const { organizationsProBuilder } = require('./data/organizations-pro-builder');
const { organizationsScoBuilder } = require('./data/organizations-sco-builder');
const { organizationsSupBuilder } = require('./data/organizations-sup-builder');
const { badgesBuilder } = require('./data/badges-builder');
const tagsBuilder = require('./data/tags-builder');
const { targetProfilesBuilder } = require('./data/target-profiles-builder');
const { usersBuilder } = require('./data/users-builder');
const usersPixRolesBuilder = require('./data/users_pix_roles-builder');
const stagesBuilder = require('./data/stages-builder');
const { certificationCpfCountryBuilder } = require('./data/certification/certification-cpf-country-builder');
const { certificationCpfCityBuilder } = require('./data/certification/certification-cpf-city-builder');
const {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
} = require('../../scripts/prod/generate-knowledge-element-snapshots-for-campaigns');
const computeParticipationsResults = require('../../scripts/prod/compute-participation-results');

const poleEmploisSendingsBuilder = require('./data/pole-emploi-sendings-builder');
const SEQUENCE_RESTART_AT_NUMBER = 10000;

exports.seed = async (knex) => {

  const databaseBuilder = new DatabaseBuilder({ knex });

  // Users
  usersBuilder({ databaseBuilder });
  usersPixRolesBuilder({ databaseBuilder });

  // Organizations
  tagsBuilder({ databaseBuilder });
  organizationsProBuilder({ databaseBuilder });
  organizationsScoBuilder({ databaseBuilder });
  organizationsSupBuilder({ databaseBuilder });

  // Target Profiles
  targetProfilesBuilder({ databaseBuilder });
  badgesBuilder({ databaseBuilder });
  stagesBuilder({ databaseBuilder });

  // Certifications
  certificationCentersBuilder({ databaseBuilder });
  certificationUsersBuilder({ databaseBuilder });
  certificationCenterMembershipsBuilder({ databaseBuilder });
  certificationUserProfilesBuilder({ databaseBuilder });
  certificationSessionsBuilder({ databaseBuilder });
  certificationCandidatesBuilder({ databaseBuilder });
  certificationCoursesBuilder({ databaseBuilder });
  certificationScoresBuilder({ databaseBuilder });
  badgeAcquisitionBuilder({ databaseBuilder });
  partnerCertificationBuilder({ databaseBuilder });
  certificationCpfCountryBuilder({ databaseBuilder });
  certificationCpfCityBuilder({ databaseBuilder });

  // Éléments de parcours
  campaignsProBuilder({ databaseBuilder });
  campaignsSupBuilder({ databaseBuilder });
  campaignsScoBuilder({ databaseBuilder });
  assessmentsBuilder({ databaseBuilder });
  answersBuilder({ databaseBuilder });

  // Éléments de parcours pour l'utilisateur Pix Aile
  buildPixAileProfile({ databaseBuilder });

  // Création d'envois pole emploi
  poleEmploisSendingsBuilder({ databaseBuilder });

  await databaseBuilder.commit();
  await alterSequenceIfPG(knex);
  const campaignParticipationData = await getEligibleCampaignParticipations(50000);
  await generateKnowledgeElementSnapshots(campaignParticipationData, 1);
  await computeParticipationsResults(10, false);
};

/**
 * Inserting elements in PGSQL when specifying their ID does not update the sequence for that id.
 * THis results in id conflict errors when trying to insert a new elements in the base.
 * Making the sequences start at an arbitrary high number prevents the problem from happening for a time.
 * (time being enough for dev ou review apps - seed are not run on staging or prod)
 */
async function alterSequenceIfPG(knex) {
  let sequenceRestartAtNumber = SEQUENCE_RESTART_AT_NUMBER;
  const sequenceNameQueryResult = await knex.raw('SELECT sequence_name FROM information_schema.sequences;');
  const sequenceNames = sequenceNameQueryResult.rows.map((row) => row.sequence_name);
  return bluebird.mapSeries(sequenceNames, async (sequenceName) => {
    await knex.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${sequenceRestartAtNumber};`);
    sequenceRestartAtNumber += (SEQUENCE_RESTART_AT_NUMBER / 10);
  });
}
