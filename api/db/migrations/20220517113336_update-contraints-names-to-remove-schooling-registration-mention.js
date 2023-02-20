const CAMPAIGN_PARTICIPATIONS_TABLE = 'campaign-participations';
const CERTIFICATION_CANDIDATES_TABLE = 'certification-candidates';
const ACCOUNT_RECOVERY_DEMANDS_TABLE = 'account-recovery-demands';
const ORGANIZATION_LEARNERS_TABLE = 'organization-learners';

const OLD_FOREIGN_KEY_IN_CAMPAIGN_PARTICIPATIONS_CONSTRAINT_NAME =
  'campaign_participations_schoolingregistrationid_foreign';
const NEW_FOREIGN_KEY_IN_CAMPAIGN_PARTICIPATIONS_CONSTRAINT_NAME =
  'campaign_participations_organizationlearnerid_foreign';

const OLD_FOREIGN_KEY_IN_CERTIFICATION_CANDIDATES_CONSTRAINT_NAME =
  'certification_candidates_schoolingregistrationid_foreign';
const NEW_FOREIGN_KEY_IN_CERTIFICATION_CANDIDATES_CONSTRAINT_NAME =
  'certification-candidates_organizationlearnerid_foreign';

const OLD_FOREIGN_KEY_IN_ACCOUNT_RECOVERY_DEMANDS_CONSTRAINT_NAME =
  'account_recovery_demands_schoolingregistrationid_foreign';
const NEW_FOREIGN_KEY_IN_ACCOUNT_RECOVERY_DEMANDS_CONSTRAINT_NAME =
  'account-recovery-demands_organizationlearnerid_foreign';

const OLD_PRIMARY_KEY_CONSTRAINT_NAME = 'students_pkey';
const NEW_PRIMARY_KEY_CONSTRAINT_NAME = 'organization_learners_pkey';

const OLD_FOREIGN_KEY_USER_ID_CONSTRAINT_NAME = 'students_userid_foreign';
const NEW_FOREIGN_KEY_USER_ID_CONSTRAINT_NAME = 'organization_learners_userid_foreign';

const OLD_FOREIGN_KEY_ORGANIZATION_ID_CONSTRAINT_NAME = 'students_organizationid_foreign';
const NEW_FOREIGN_KEY_ORGANIZATION_ID_CONSTRAINT_NAME = 'organization_learners_organizationid_foreign';

const OLD_UNIQUE_USER_ID_ORGANIZATION_ID_CONSTRAINT_NAME = 'students_userid_organizationid_unique';
const NEW_UNIQUE_USER_ID_ORGANIZATION_ID_CONSTRAINT_NAME = 'organization_learners_userid_organizationid_unique';

const OLD_UNIQUE_ORGANIZATION_ID_NATIONAL_STUDENT_ID_CONSTRAINT_NAME =
  'students_organizationid_nationalstudentid_unique';
const NEW_UNIQUE_ORGANIZATION_ID_NATIONAL_STUDENT_ID_CONSTRAINT_NAME =
  'organization_learners_organizationid_nationalstudentid_unique';

const OLD_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME =
  'schooling_registrations_organizationid_nationalapprenticeid_uni';
const NEW_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME =
  'organization_learners_organizationid_nationalapprenticeid_unique';

const OLD_UNIQUE_ORGANIZATION_ID_STUDENT_NUMBER_CONSTRAINT_NAME =
  'schooling_registrations_studentnumber_organizationid_unique';
const NEW_UNIQUE_ORGANIZATION_ID_STUDENT_NUMBER_CONSTRAINT_NAME =
  'organization_learners_organizationid_studentnumber_unique';

export const up = async (knex) => {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${CAMPAIGN_PARTICIPATIONS_TABLE}" RENAME CONSTRAINT "${OLD_FOREIGN_KEY_IN_CAMPAIGN_PARTICIPATIONS_CONSTRAINT_NAME}" TO "${NEW_FOREIGN_KEY_IN_CAMPAIGN_PARTICIPATIONS_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${CERTIFICATION_CANDIDATES_TABLE}" RENAME CONSTRAINT "${OLD_FOREIGN_KEY_IN_CERTIFICATION_CANDIDATES_CONSTRAINT_NAME}" TO "${NEW_FOREIGN_KEY_IN_CERTIFICATION_CANDIDATES_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ACCOUNT_RECOVERY_DEMANDS_TABLE}" RENAME CONSTRAINT "${OLD_FOREIGN_KEY_IN_ACCOUNT_RECOVERY_DEMANDS_CONSTRAINT_NAME}" TO "${NEW_FOREIGN_KEY_IN_ACCOUNT_RECOVERY_DEMANDS_CONSTRAINT_NAME}";`
  );

  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${OLD_PRIMARY_KEY_CONSTRAINT_NAME}" TO "${NEW_PRIMARY_KEY_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${OLD_FOREIGN_KEY_USER_ID_CONSTRAINT_NAME}" TO "${NEW_FOREIGN_KEY_USER_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${OLD_FOREIGN_KEY_ORGANIZATION_ID_CONSTRAINT_NAME}" TO "${NEW_FOREIGN_KEY_ORGANIZATION_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${OLD_UNIQUE_USER_ID_ORGANIZATION_ID_CONSTRAINT_NAME}" TO "${NEW_UNIQUE_USER_ID_ORGANIZATION_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${OLD_UNIQUE_ORGANIZATION_ID_NATIONAL_STUDENT_ID_CONSTRAINT_NAME}" TO "${NEW_UNIQUE_ORGANIZATION_ID_NATIONAL_STUDENT_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${OLD_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME}" TO "${NEW_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${OLD_UNIQUE_ORGANIZATION_ID_STUDENT_NUMBER_CONSTRAINT_NAME}" TO "${NEW_UNIQUE_ORGANIZATION_ID_STUDENT_NUMBER_CONSTRAINT_NAME}";`
  );
};

export const down = async (knex) => {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${CAMPAIGN_PARTICIPATIONS_TABLE}" RENAME CONSTRAINT "${NEW_FOREIGN_KEY_IN_CAMPAIGN_PARTICIPATIONS_CONSTRAINT_NAME}" TO "${OLD_FOREIGN_KEY_IN_CAMPAIGN_PARTICIPATIONS_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${CERTIFICATION_CANDIDATES_TABLE}" RENAME CONSTRAINT "${NEW_FOREIGN_KEY_IN_CERTIFICATION_CANDIDATES_CONSTRAINT_NAME}" TO "${OLD_FOREIGN_KEY_IN_CERTIFICATION_CANDIDATES_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ACCOUNT_RECOVERY_DEMANDS_TABLE}" RENAME CONSTRAINT "${NEW_FOREIGN_KEY_IN_ACCOUNT_RECOVERY_DEMANDS_CONSTRAINT_NAME}" TO "${OLD_FOREIGN_KEY_IN_ACCOUNT_RECOVERY_DEMANDS_CONSTRAINT_NAME}";`
  );

  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${NEW_PRIMARY_KEY_CONSTRAINT_NAME}" TO "${OLD_PRIMARY_KEY_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${NEW_FOREIGN_KEY_USER_ID_CONSTRAINT_NAME}" TO "${OLD_FOREIGN_KEY_USER_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${NEW_FOREIGN_KEY_ORGANIZATION_ID_CONSTRAINT_NAME}" TO "${OLD_FOREIGN_KEY_ORGANIZATION_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${NEW_UNIQUE_USER_ID_ORGANIZATION_ID_CONSTRAINT_NAME}" TO "${OLD_UNIQUE_USER_ID_ORGANIZATION_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${NEW_UNIQUE_ORGANIZATION_ID_NATIONAL_STUDENT_ID_CONSTRAINT_NAME}" TO "${OLD_UNIQUE_ORGANIZATION_ID_NATIONAL_STUDENT_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${NEW_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME}" TO "${OLD_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME}";`
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `ALTER TABLE "${ORGANIZATION_LEARNERS_TABLE}" RENAME CONSTRAINT "${NEW_UNIQUE_ORGANIZATION_ID_STUDENT_NUMBER_CONSTRAINT_NAME}" TO "${OLD_UNIQUE_ORGANIZATION_ID_STUDENT_NUMBER_CONSTRAINT_NAME}";`
  );
};
