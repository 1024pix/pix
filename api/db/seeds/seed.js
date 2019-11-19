'use strict';
const faker = require('faker');
const DatabaseBuilder = require('../../tests/tooling/database-builder/database-builder');
const answersBuilder = require('./data/answers-builder');
const assessmentsBuilder = require('./data/assessments-builder');
const assessmentResultsBuilder = require('./data/assessment-results-builder');
const campaignParticipationsBuilder = require('./data/campaign-participations-builder');
const campaignsBuilder = require('./data/campaigns-builder');
const certificationCandidatesBuilder = require('./data/certification-candidates-builder');
const certificationCentersBuilder = require('./data/certification-centers-builder');
const certificationCenterMembershipsBuilder = require('./data/certification-center-memberships-builder');
const certificationChallengesBuilder = require('./data/certification-challenges-builder');
const certificationCoursesBuilder = require('./data/certification-courses-builder');
const competenceMarksBuilder = require('./data/competence-marks-builder');
const dragonAndCoBuilder = require('./data/dragon-and-co-builder');
const organizationsBuilder = require('./data/organizations-builder');
const pixAileBuilder = require('./data/pix-aile-builder');
const buildPixAileProfile = require('./data/pix-aile-profile-builder');
const sessionsBuilder = require('./data/sessions-builder');
const snapshotsBuilder = require('./data/snapshots-builder');
const targetProfilesBuilder = require('./data/target-profiles-builder');
const usersBuilder = require('./data/users-builder');
const usersPixRolesBuilder = require('./data/users_pix_roles-builder');

const SEQUENCE_RESTART_AT_NUMBER = 10000000;
const SEED_NUMBER = 20110228;

exports.seed = (knex) => {
  faker.seed(SEED_NUMBER);
  
  const databaseBuilder = new DatabaseBuilder({ knex });

  usersBuilder({ databaseBuilder });
  usersPixRolesBuilder({ databaseBuilder });
  pixAileBuilder({ databaseBuilder });
  dragonAndCoBuilder({ databaseBuilder });
  organizationsBuilder({ databaseBuilder });
  snapshotsBuilder({ databaseBuilder });
  targetProfilesBuilder({ databaseBuilder });
  campaignsBuilder({ databaseBuilder });
  campaignParticipationsBuilder({ databaseBuilder });
  certificationCentersBuilder({ databaseBuilder });
  certificationCenterMembershipsBuilder({ databaseBuilder });
  sessionsBuilder({ databaseBuilder });
  certificationCandidatesBuilder({ databaseBuilder });
  certificationCoursesBuilder({ databaseBuilder });
  certificationChallengesBuilder({ databaseBuilder });
  assessmentsBuilder({ databaseBuilder });
  answersBuilder({ databaseBuilder });
  assessmentResultsBuilder({ databaseBuilder });
  competenceMarksBuilder({ databaseBuilder });
  buildPixAileProfile({ databaseBuilder });

  return databaseBuilder.commit()
    .then(() => alterSequenceIfPG(knex));
};

/**
 * Inserting elements in PGSQL when specifying their ID does not update the sequence for that id.
 * THis results in id conflict errors when trying to insert a new elements in the base.
 * Making the sequences start at an arbitrary high number prevents the problem from happening for a time.
 * (time being enough for dev ou review apps - seed are not run on staging or prod)
 */
function alterSequenceIfPG(knex) {

  const isPG = process.env.DATABASE_URL || false;

  if (isPG) {
    return knex.raw('SELECT sequence_name FROM information_schema.sequences;')
      .then((sequenceNameQueryResult) => {
        const sequenceNames = sequenceNameQueryResult.rows.map((row) => row.sequence_name);

        const sequenceUpdatePromises = sequenceNames.map((sequenceName) => {
          return knex.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${SEQUENCE_RESTART_AT_NUMBER};`);
        });
        return Promise.all(sequenceUpdatePromises);
      });
  }
}
