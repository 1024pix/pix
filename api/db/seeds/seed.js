'use strict';
const DatabaseBuilder = require('../../tests/tooling/database-builder/database-builder');
const pixAileBuilder = require('./data/user-with-related/pix-aile-builder');
const dragonAndCoBuilder = require('./data/organization-with-related/dragon-and-co-builder');

const SEQUENCE_RESTART_AT_NUMBER = 10000000;

const listSeeds = {
  '1st-to-create': [
    'sessions',
    'users',
  ],
  '2nd-to-create': [
    'assessments',
    'certification-courses',
    'organizations',
    'users_pix_roles',
  ],
  '3rd-to-create': [
    'answers',
    'assessment-results',
    'certification-challenges',
    'snapshots',
    'campaigns',
  ],
  '4th-to-create': [
    'competence-marks',
  ],
};

function addData(knex, table, data) {
  return Promise.all(data)
    .then((data) => {
      return knex(table)
        .insert(data)
        .catch(console.log);
    });
}

function createDataByTables(groupName) {
  const directory = groupName;
  const files = listSeeds[groupName];

  return files.map((tableName) => {
    return {
      table: tableName,
      data: require('./data/' + directory + '/' + tableName + '.js'),
    };
  });
}

function insertSeedsByGroup(knex, groupName) {
  const dataByTables = createDataByTables(groupName);
  const dataToAdd = dataByTables.map((dataByTable) => {
    return addData(knex, dataByTable.table, dataByTable.data);
  });
  return Promise.all(dataToAdd);
}

exports.seed = (knex) => {

  const databaseBuilder = new DatabaseBuilder({ knex });
  pixAileBuilder({ databaseBuilder });
  dragonAndCoBuilder({ databaseBuilder });

  return databaseBuilder.commit()
    .then(() => insertSeedsByGroup(knex, '1st-to-create'))
    .then(() => insertSeedsByGroup(knex, '2nd-to-create'))
    .then(() => insertSeedsByGroup(knex, '3rd-to-create'))
    .then(() => insertSeedsByGroup(knex, '4th-to-create'))
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
