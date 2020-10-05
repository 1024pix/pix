'use strict';

const Airtable = require('airtable');
const _ = require('lodash');
const format = require('pg-format');
const { runDBOperation } = require('./db-connection');

const tables = [{
  name:'areas',
  airtableName:'Domaines',
  fields: [
    { name:'name', type:'text', airtableName:'Nom' },
  ],
  airtableId:'id persistant',
  indices: [],
},{
  name:'competences',
  airtableName:'Competences',
  fields: [
    { name:'name', type:'text', airtableName:'Référence' },
    { name:'code', type:'text', airtableName:'Sous-domaine' },
    { name:'title', type:'text', airtableName:'Titre' },
    { name:'areaId', type:'text', airtableName:'Domaine (id persistant)', isArray:false },
  ],
  airtableId:'id persistant',
  indices: ['areaId'],
},{
  name:'tubes',
  airtableName:'Tubes',
  fields: [
    { name:'name', type:'text', airtableName:'Nom' },
    { name:'title', type:'text', airtableName:'Titre' },
    { name:'competenceId', type:'text', airtableName:'Competences (id persistant)', isArray:false },
  ],
  airtableId:'id persistant',
  indices: ['competenceId'],
},{
  name:'skills',
  airtableName:'Acquis',
  fields: [
    { name:'name', type:'text', airtableName:'Nom' },
    { name:'description', type:'text', airtableName:'Description' },
    { name:'level', type:'smallint', airtableName:'Level' },
    { name:'tubeId', type:'text', airtableName:'Tube (id persistant)', isArray:false },
    { name:'status', type:'text', airtableName:'Status' },
    { name:'pixValue', type:'numeric(6,5)', airtableName:'PixValue' },
  ],
  airtableId:'id persistant',
  indices: ['tubeId'],
},{
  name:'challenges',
  airtableName:'Epreuves',
  fields: [
    { name:'instructions', type:'text', airtableName:'Consigne' },
    { name:'status', type:'text', airtableName:'Statut' },
    { name:'type', type:'text', airtableName:'Type d\'épreuve' },
    { name:'timer', type:'smallint', airtableName:'Timer' },
    { name:'autoReply', type:'boolean', airtableName:'Réponse automatique' },
    { name:'skillIds', type:'text []', airtableName:'Acquix (id persistant)', isArray:true },
    { name:'skillCount', type:'smallint', extractor: (record) => _.size(record.get('Acquix (id persistant)')) },
    { name:'firstSkillId', type:'text', extractor: (record) => _.get(record.get('Acquix (id persistant)'), 0) },
    { name:'secondSkillId', type:'text', extractor: (record) => _.get(record.get('Acquix (id persistant)'), 1) },
    { name:'thirdSkillId', type:'text', extractor: (record) => _.get(record.get('Acquix (id persistant)'), 2) },
  ],
  airtableId:'id persistant',
  indices: ['firstSkillId'],
}, {
  name:'courses',
  airtableName:'Tests',
  fields: [
    { name:'name', type:'text', airtableName:'Nom' },
    { name:'adaptive', type:'boolean', airtableName:'Adaptatif ?' },
    { name:'competenceId', type:'text', airtableName:'Competence (id persistant)', isArray:false },
  ],
  airtableId:'id persistant',
  indices: ['competenceId'],
}, {
  name:'tutorials',
  airtableName:'Tutoriels',
  fields: [
    { name:'title', type:'text', airtableName:'Titre' },
    { name:'link', type:'text', airtableName:'Lien' },
  ],
  airtableId:'id persistant',
  indices: ['title'],
},
];

async function run() {
  await Promise.all(tables.map(async (table) => {
    const data = await _getItems(table);
    await _dropTable(table.name);
    await _createTable(table);
    await _saveItems(table, data);
  }));
}

async function _dropTable(tableName) {
  return runDBOperation(async (client) => {
    const dropQuery = `DROP TABLE IF EXISTS ${format.ident(tableName)} CASCADE`;
    await client.query(dropQuery);
  });
}

async function _createTable(table) {
  await runDBOperation(async (client) => {
    const fieldsText = ['"id" text PRIMARY KEY'].concat(table.fields.map((field) => {
      return format('\t%I\t%s', field.name, field.type + (field.type === 'boolean' ? ' NOT NULL' : ''));
    })).join(',\n');
    const createQuery = format('CREATE TABLE %I (%s)', table.name, fieldsText);
    await client.query(createQuery);
    for (const index of table.indices) {
      const indexQuery = format ('CREATE INDEX %I on %I (%I)', `${table.name}_${index}_idx`, table.name, index);
      await client.query(indexQuery);
    }
  });
}

async function _saveItems(table, items) {
  await runDBOperation(async (client) => {
    const fields = ['id'].concat(table.fields.map((field) => field.name));
    const values = items.map((item) => fields.map((field) => item[field]));
    const saveQuery = format('INSERT INTO %I (%I) VALUES %L', table.name, fields, values);
    await client.query(saveQuery);
  });
}

function _initAirtable() {
  return new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(process.env.AIRTABLE_BASE);
}

async function _getItems(structure) {
  const base = _initAirtable();
  const fields = structure.fields;
  const airtableFields = _.compact(fields.map((field) => field.airtableName));
  if (structure.airtableId) {
    airtableFields.push(structure.airtableId);
  }
  const records = await base(structure.airtableName).select({
    fields: airtableFields,
  }).all();
  return records.map((record) => {
    const item = { id:record.get(structure.airtableId) || record.getId() };
    fields.forEach((field) => {
      let value = field.extractor ? field.extractor(record) : record.get(field.airtableName);
      if (Array.isArray(value)) {
        if (!field.isArray) {
          value = value[0];
        } else {
          value = `{${value.join(',')}}`;
        }
      }
      if (field.type === 'boolean') {
        value = Boolean(value);
      }
      item[field.name] = value;
    });
    return item;
  });
}

module.exports = {
  run,
};
