'use strict';
const faker = require('faker');

const DatabaseBuilder = require('../database-builder/database-builder');

const answersBuilder = require('./data/answers-builder');
const assessmentsBuilder = require('./data/assessments-builder');
const buildPixAileProfile = require('./data/pix-aile-profile-builder');
const campaignParticipationsBuilder = require('./data/campaign-participations-builder');
const campaignsBuilder = require('./data/campaigns-builder');
const { certificationCandidatesBuilder } = require('./data/certification/certification-candidates-builder');
const { badgeAcquisitionBuilder } = require('./data/certification/badge-acquisition-builder');
const { partnerCertificationBuilder } = require('./data/certification/partner-certification-builder');
const { certificationCentersBuilder } = require('./data/certification/certification-centers-builder');
const { certificationCoursesBuilder } = require('./data/certification/certification-courses-builder');
const certificationScoresBuilder = require('./data/certification/certification-scores-builder');
const { certificationSessionsBuilder } = require('./data/certification/certification-sessions-builder');
const { certificationUsersBuilder } = require('./data/certification/users');
const certificationUserProfilesBuilder = require('./data/certification/user-profiles-builder');
const certificationCenterMembershipsBuilder = require('./data/certification/certification-center-memberships-builder');
const organizationsProBuilder = require('./data/organizations-pro-builder');
const organizationsScoBuilder = require('./data/organizations-sco-builder');
const organizationsSupBuilder = require('./data/organizations-sup-builder');
const { badgesBuilder } = require('./data/badges-builder');
const tagsBuilder = require('./data/tags-builder');
const { targetProfilesBuilder } = require('./data/target-profiles-builder');
const { usersBuilder } = require('./data/users-builder');
const usersPixRolesBuilder = require('./data/users_pix_roles-builder');
const stagesBuilder = require('./data/stages-builder');
const {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
} = require('../../scripts/prod/generate-knowledge-element-snapshots-for-campaigns');

const SEQUENCE_RESTART_AT_NUMBER = 10000000;
const SEED_NUMBER = 20110228;

exports.seed = async (knex) => {
  faker.seed(SEED_NUMBER);

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

  // Éléments de parcours
  campaignsBuilder({ databaseBuilder });
  campaignParticipationsBuilder({ databaseBuilder });
  assessmentsBuilder({ databaseBuilder });
  answersBuilder({ databaseBuilder });

  // Éléments de parcours pour l'utilisateur Pix Aile
  buildPixAileProfile({ databaseBuilder });

  await databaseBuilder.commit();
  await alterSequenceIfPG(knex);
  const campaignParticipationData = await getEligibleCampaignParticipations(50000);
  await generateKnowledgeElementSnapshots(campaignParticipationData, 1);
};

/**
 * Inserting elements in PGSQL when specifying their ID does not update the sequence for that id.
 * THis results in id conflict errors when trying to insert a new elements in the base.
 * Making the sequences start at an arbitrary high number prevents the problem from happening for a time.
 * (time being enough for dev ou review apps - seed are not run on staging or prod)
 */
function alterSequenceIfPG(knex) {
  return knex.raw('SELECT sequence_name FROM information_schema.sequences;')
    .then((sequenceNameQueryResult) => {
      const sequenceNames = sequenceNameQueryResult.rows.map((row) => row.sequence_name);

      const sequenceUpdatePromises = sequenceNames.map((sequenceName) => {
        return knex.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${SEQUENCE_RESTART_AT_NUMBER};`);
      });
      return Promise.all(sequenceUpdatePromises);
    });
}
