import { DatabaseSync } from 'node:sqlite';

const types = {
  boolean: {
    sqliteType: 'INTEGER',
    toSqlite: (value) => (value ? 1 : 0),
    fromSqlite: (value) => value === 1,
  },
  float: {
    sqliteType: 'REAL',
  },
  integer: {
    sqliteType: 'INTEGER',
  },
  json: {
    sqliteType: 'TEXT',
    toSqlite: (value) => JSON.stringify(value),
    fromSqlite: (value) => JSON.parse(value),
  },
  string: {
    sqliteType: 'TEXT',
  },
};

const tables = {
  frameworks: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'name', nullable: true, type: 'string' },
    ],
  },
  areas: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'code', nullable: true, type: 'string' },
      { name: 'name', nullable: true, type: 'string' },
      { name: 'title_i18n', nullable: true, type: 'json' },
      { name: 'color', nullable: true, type: 'string' },
      { name: 'frameworkId', nullable: true, type: 'string' },
      { name: 'competenceIds', nullable: true, type: 'json' },
    ],
  },
  competences: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'name_i18n', nullable: true, type: 'json' },
      { name: 'description_i18n', nullable: true, type: 'json' },
      { name: 'index', nullable: true, type: 'string' },
      { name: 'origin', nullable: true, type: 'string' },
      { name: 'areaId', nullable: true, type: 'string' },
      { name: 'skillIds', nullable: true, type: 'json' },
      { name: 'thematicIds', nullable: true, type: 'json' },
    ],
  },
  thematics: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'name_i18n', nullable: true, type: 'json' },
      { name: 'index', nullable: true, type: 'integer' },
      { name: 'competenceId', nullable: true, type: 'string' },
      { name: 'tubeIds', nullable: true, type: 'json' },
    ],
  },
  tubes: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'name', nullable: true, type: 'string' },
      { name: 'title', nullable: true, type: 'string' },
      { name: 'description', nullable: true, type: 'string' },
      { name: 'practicalTitle_i18n', nullable: true, type: 'json' },
      { name: 'practicalDescription_i18n', nullable: true, type: 'json' },
      { name: 'competenceId', nullable: true, type: 'string' },
      { name: 'thematicId', nullable: true, type: 'string' },
      { name: 'skillIds', nullable: true, type: 'json' },
      { name: 'isMobileCompliant', nullable: true, type: 'boolean' },
      { name: 'isTabletCompliant', nullable: true, type: 'boolean' },
    ],
  },
  skills: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'name', nullable: true, type: 'string' },
      { name: 'status', nullable: true, type: 'string' },
      { name: 'pixValue', nullable: true, type: 'float' },
      { name: 'version', nullable: true, type: 'integer' },
      { name: 'level', nullable: true, type: 'integer' },
      { name: 'hintStatus', nullable: true, type: 'string' },
      { name: 'hint_i18n', nullable: true, type: 'json' },
      { name: 'competenceId', nullable: true, type: 'string' },
      { name: 'tubeId', nullable: true, type: 'string' },
      { name: 'tutorialIds', nullable: true, type: 'json' },
      { name: 'learningMoreTutorialIds', nullable: true, type: 'json' },
    ],
  },
  challenges: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'instruction', nullable: true, type: 'string' },
      { name: 'alternativeInstruction', nullable: true, type: 'string' },
      { name: 'proposals', nullable: true, type: 'string' },
      { name: 'type', nullable: true, type: 'string' },
      { name: 'solution', nullable: true, type: 'string' },
      { name: 'solutionToDisplay', nullable: true, type: 'string' },
      { name: 't1Status', nullable: true, type: 'boolean' },
      { name: 't2Status', nullable: true, type: 'boolean' },
      { name: 't3Status', nullable: true, type: 'boolean' },
      { name: 'status', nullable: true, type: 'string' },
      { name: 'genealogy', nullable: true, type: 'string' },
      { name: 'accessibility1', nullable: true, type: 'string' },
      { name: 'accessibility2', nullable: true, type: 'string' },
      { name: 'requireGafamWebsiteAccess', nullable: true, type: 'boolean' },
      { name: 'isIncompatibleIpadCertif', nullable: true, type: 'boolean' },
      { name: 'deafAndHardOfHearing', nullable: true, type: 'string' },
      { name: 'isAwarenessChallenge', nullable: true, type: 'boolean' },
      { name: 'toRephrase', nullable: true, type: 'boolean' },
      { name: 'alternativeVersion', nullable: true, type: 'integer' },
      { name: 'shuffled', nullable: true, type: 'boolean' },
      { name: 'illustrationAlt', nullable: true, type: 'string' },
      { name: 'illustrationUrl', nullable: true, type: 'string' },
      { name: 'attachments', nullable: true, type: 'json' },
      { name: 'responsive', nullable: true, type: 'string' },
      { name: 'autoReply', nullable: true, type: 'boolean' },
      { name: 'focusable', nullable: true, type: 'boolean' },
      { name: 'format', nullable: true, type: 'string' },
      { name: 'timer', nullable: true, type: 'integer' },
      { name: 'embedHeight', nullable: true, type: 'integer' },
      { name: 'embedUrl', nullable: true, type: 'string' },
      { name: 'embedTitle', nullable: true, type: 'string' },
      { name: 'locales', nullable: true, type: 'json' },
      { name: 'competenceId', nullable: true, type: 'string' },
      { name: 'skillId', nullable: true, type: 'string' },
      { name: 'hasEmbedInternalValidation', nullable: true, type: 'boolean' },
      { name: 'noValidationNeeded', nullable: true, type: 'boolean' },
    ],
  },
  tutorials: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'duration', nullable: true, type: 'string' },
      { name: 'format', nullable: true, type: 'string' },
      { name: 'title', nullable: true, type: 'string' },
      { name: 'source', nullable: true, type: 'string' },
      { name: 'link', nullable: true, type: 'string' },
      { name: 'locale', nullable: true, type: 'string' },
    ],
  },
  courses: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'string' },
      { name: 'name', nullable: true, type: 'string' },
      { name: 'description', nullable: true, type: 'string' },
      { name: 'isActive', nullable: true, type: 'boolean' },
      { name: 'competences', nullable: true, type: 'json' },
      { name: 'challenges', nullable: true, type: 'json' },
    ],
  },
  missions: {
    primaryKey: 'id',
    columns: [
      { name: 'id', nullable: false, type: 'integer' },
      { name: 'status', nullable: true, type: 'string' },
      { name: 'name_i18n', nullable: true, type: 'json' },
      { name: 'content', nullable: true, type: 'json' },
      { name: 'learningObjectives_i18n', nullable: true, type: 'json' },
      { name: 'validatedObjectives_i18n', nullable: true, type: 'json' },
      { name: 'introductionMediaType', nullable: true, type: 'string' },
      { name: 'introductionMediaUrl', nullable: true, type: 'string' },
      { name: 'introductionMediaAlt_i18n', nullable: true, type: 'json' },
      { name: 'documentationUrl', nullable: true, type: 'string' },
      { name: 'cardImageUrl', nullable: true, type: 'string' },
      { name: 'competenceId', nullable: true, type: 'string' },
    ],
  },
};

Object.values(tables).forEach((table) => {
  const mappedColumns = table.columns.filter((column) => 'toSqlite' in types[column.type]);

  if (mappedColumns.length === 0) {
    table.toSqlite = (value) => value;
    table.fromSqlite = (value) => value;
    return;
  }

  const toSqliteMappers = mappedColumns.map(({ name, type }) => {
    const { toSqlite } = types[type];
    return (value) => {
      value[name] = toSqlite(value[name]);
    };
  });

  table.toSqlite = (value) => {
    const sqliteValue = { ...value };
    toSqliteMappers.forEach((mapper) => mapper(sqliteValue));
    console.log('toSqlite', value, sqliteValue);
    return sqliteValue;
  };

  const fromSqliteMappers = mappedColumns.map(({ name, type }) => {
    const { fromSqlite } = types[type];
    return (value) => {
      value[name] = fromSqlite(value[name]);
    };
  });

  table.fromSqlite = (value) => {
    fromSqliteMappers.forEach((mapper) => mapper(value));
    return value;
  };
});

/** @type {DatabaseSync} */
let instance;

export function getInstance() {
  if (instance === undefined) {
    instance = new DatabaseSync(':memory:');
    createTables(instance);
  }
  return instance;
}

/**
 * @param {DatabaseSync} instance
 */
function createTables(instance) {
  Object.entries(tables).forEach(([name, { columns, primaryKey }]) => {
    instance.exec(`CREATE TABLE "${name}" (${columns.map(columnToSql).join(', ')}, PRIMARY KEY("${primaryKey}"))`);
  });
}

function columnToSql(column) {
  let sql = `"${column.name}" ${types[column.type].sqliteType}`;
  if (!column.nullable) sql += ' NOT NULL';
  return sql;
}

/**
 * @param {string} tableName
 */
export function getMapAdapter(tableName) {
  return new MapAdapter({ sqlite: getInstance(), tableName });
}

class MapAdapter {
  #get;
  #set;
  #delete;
  #clear;
  #size;

  #fromSqlite;
  #toSqlite;

  /**
   * @param {{
   *   sqlite: DatabaseSync
   *   tableName: string
   * }} options
   */
  constructor({ sqlite, tableName }) {
    const table = tables[tableName];

    this.#get = sqlite.prepare(`SELECT * FROM "${tableName}" WHERE "${table.primaryKey}" = ?`);
    this.#set = sqlite.prepare(
      `INSERT INTO "${tableName}" (${table.columns.map((column) => `"${column.name}"`).join(', ')}) VALUES (${table.columns.map((column) => `:${column.name}`).join(', ')})`,
    );
    this.#delete = sqlite.prepare(`DELETE FROM "${tableName}" WHERE "${table.primaryKey}" = ?`);
    this.#clear = sqlite.prepare(`DELETE FROM "${tableName}"`);
    this.#size = sqlite.prepare(`SELECT COUNT(*) AS "size" FROM "${tableName}"`);

    this.#fromSqlite = table.fromSqlite;
    this.#toSqlite = table.toSqlite;
  }

  /**
   * @param {string | number} key
   */
  get(key) {
    const row = this.#get.get(key);
    if (!row) return undefined;
    console.log('get', key, row);
    return this.#fromSqlite(row);
  }

  /**
   * @param {string | number} _key
   * @param {object} value
   */
  set(_key, value) {
    console.log('set', _key, this.#toSqlite(value));
    this.#set.run(this.#toSqlite(value));
  }

  /**
   * @param {string | number} key
   */
  delete(key) {
    this.#delete.run(key);
  }

  clear() {
    this.#clear.run();
  }

  get size() {
    return this.#size.get().size;
  }
}
