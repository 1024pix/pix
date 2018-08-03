'use strict';

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
    'organizations-accesses',
  ],
  '4th-to-create': [
    'competence-marks',
  ],
};

function addData(knex, table, data) {
  return Promise.all(data)
    .then(data => {
      return knex(table)
        .insert(data)
        .catch(console.log);
    });
}

function createDataByTables(groupName) {
  const directory = groupName;
  const files = listSeeds[groupName];
  return files.map(tableName => {
    return {
      table: tableName,
      data: require('./data/'+directory+'/'+tableName+'.js')
    };
  });
}

function insertSeedsByGroup(knex, groupName) {
  const dataByTables = createDataByTables(groupName);
  const dataToAdd = dataByTables.map(dataByTable => {
    return addData(knex, dataByTable.table, dataByTable.data);
  });
  return Promise.all(dataToAdd);
}

exports.seed = (knex) => {
  // FIXME seeds have broken foreign keys which means it don't work on PostgreSQL
  return insertSeedsByGroup(knex, '1st-to-create')
    .then(() => insertSeedsByGroup(knex, '2nd-to-create'))
    .then(() => insertSeedsByGroup(knex, '3rd-to-create'))
    .then(() => insertSeedsByGroup(knex, '4th-to-create'));
};
