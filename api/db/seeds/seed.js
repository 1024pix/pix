'use strict';
const listSeeds = [
  'assessments',
  'answers',
  'certification-courses',
  'certification-challenges',
  'marks',
  'organizations',
  'users',
  'snapshots'];

function addData(knex, table, data) {
  return Promise.all(data)
    .then(data => {
      return knex(table)
        .insert(data)
        .catch((err) => {
          console.log(err);
        });
    });
}

function createDataByTables() {
  return listSeeds.map(tableName => {
    return {
      table: tableName,
      data: require('./data/'+tableName+'.js')
    };
  });
}

exports.seed = (knex) => {
  const dataByTables = createDataByTables();
  const dataToAdd = dataByTables.map(dataByTable => {
    return addData(knex, dataByTable.table, dataByTable.data);
  });
  return Promise.all(dataToAdd);
};
