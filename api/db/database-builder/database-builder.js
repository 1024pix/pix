/* eslint-disable knex/avoid-injections */
import _ from 'lodash';

import { databaseBuffer as defaultDatabaseBuffer } from './database-buffer.js';
import * as databaseHelpers from './database-helpers.js';
import { factory } from './factory/index.js';

const READONLY_TABLES = [
  'knex_migrations',
  'knex_migrations_lock',
  'view-active-organization-learners',
  'pgboss.version',
];
const CHUNK_SIZE = 1000;

/**
 * @class DatabaseBuilder
 * @property {Factory} factory
 */
export class DatabaseBuilder {
  #beforeEmptyDatabase;
  #emptyFirst;
  #databaseBuffer;

  #isFirstCommit = true;

  #tablesOrderedByDependency;
  #insertPriority;
  #deletePriority;
  #dirtyTables = new Set();

  constructor({ knex, emptyFirst = true, databaseBuffer = defaultDatabaseBuffer, beforeEmptyDatabase }) {
    this.knex = knex;
    this.factory = factory;
    this.#databaseBuffer = databaseBuffer;
    this.#emptyFirst = emptyFirst;
    this.#beforeEmptyDatabase = beforeEmptyDatabase;

    this.#addListeners();
  }

  static async create({ knex, emptyFirst = true, beforeEmptyDatabase }) {
    const databaseBuilder = new DatabaseBuilder({ knex, emptyFirst, beforeEmptyDatabase });

    try {
      await databaseBuilder.#init();
    } catch {
      // Error thrown only with unit tests
    }

    return databaseBuilder;
  }

  async commit() {
    await this.#init();

    const orderedObjectsToInsert = Object.entries(this.#databaseBuffer.objectsToInsert).sort(
      ([tableName1], [tableName2]) => this.#insertPriority.get(tableName1) - this.#insertPriority.get(tableName2),
    );

    try {
      await this.knex.transaction(async (trx) => {
        for (const [tableName, objectsToInsert] of orderedObjectsToInsert) {
          for (const chunk of _.chunk(objectsToInsert, CHUNK_SIZE)) {
            await trx.insert(chunk).into(tableName);
          }
          this.#dirtyTables.add(tableName);
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Erreur dans databaseBuilder.commit() : ${err}`);
      this.#dirtyTables.clear();
      throw err;
    } finally {
      this.#databaseBuffer.objectsToInsert = [];
    }
  }

  async clean() {
    if (this.#dirtyTables.size) {
      await this.knex.raw(
        Array.from(this.#dirtyTables)
          .sort((tableName1, tableName2) => this.#deletePriority.get(tableName1) - this.#deletePriority.get(tableName2))
          .map(deleteFrom)
          .join('\n'),
      );
    }

    this.#databaseBuffer.purge();
    this.#dirtyTables.clear();
  }

  /**
   * Database builder is used to create data:
   *   - for automated tests;
   *   - for manual tests (aka "seeds").
   *
   * To make tests and seeds easier to write, identifiers are defined in the file and passed to the database builder.
   * (In a production environment, this never happens. The database is the only in charge of supplying an identifier
   * using a sequence).
   * Inserting elements in PGSQL when specifying their ID does not update the sequence for that id.
   * It is hence important to update sequences to avoid conflict with hard coded identifier
   * i.e. ERROR: duplicate key value violates unique constraint "pk_***"
   */
  async fixSequences() {
    if (!this.#dirtyTables.size) return;

    const dirtyTablesSequencesInfo = await this.#getDirtyTablesSequencesInfo();

    for (const dirtyTablesSequence of dirtyTablesSequencesInfo) {
      const { tableName, sequenceName } = dirtyTablesSequence;
      const sequenceRestartAtNumber = (await this.#getTableMaxId(tableName)) + 1;
      if (sequenceRestartAtNumber !== 0) {
        await this.knex.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${sequenceRestartAtNumber};`);
      }
    }
  }

  async #getDirtyTablesSequencesInfo() {
    const database = this.knex.client.database();

    const rawSequencesInfo = await this.knex
      .from('information_schema.columns')
      .select('table_name', 'column_default')
      .whereRaw("column_default like 'nextval%'")
      .where({ table_catalog: database, column_name: 'id' })
      .whereIn('table_name', Array.from(this.#dirtyTables));

    const sequencesInfo = rawSequencesInfo.map(({ table_name, column_default }) => ({
      tableName: table_name,
      sequenceName: column_default.replaceAll('"', '').slice("nextval('".length, -"'::regclass)".length),
    }));
    return sequencesInfo;
  }

  async #getTableMaxId(tableName) {
    const { max } = await this.knex.from(tableName).max('id').first();
    return max;
  }

  async #init() {
    if (!this.#isFirstCommit) return;
    await this.#loadTables();
    if (this.#emptyFirst) {
      await this.emptyDatabase();
    }
    this.#isFirstCommit = false;
  }

  async emptyDatabase({ keepLearningContent = false } = {}) {
    this.#beforeEmptyDatabase?.();

    const sortedTableNames = this.#tablesOrderedByDependency
      .map(sanitizeTableName)
      .filter((tableName) => {
        return keepLearningContent ? !tableName.includes('learningcontent') : true;
      })
      .join(',');
    return this.knex.raw(`TRUNCATE ${sortedTableNames}`);
  }

  async #loadTables() {
    // See this link : https://stackoverflow.com/questions/51279588/sort-tables-in-order-of-dependency-postgres
    function _constructRawQuery(namespace) {
      return `with recursive fk_tree as (
      select t.oid as reloid,
      t.relname as table_name,
      s.nspname as schema_name,
      null::name as referenced_table_name,
      null::name as referenced_schema_name,
      1 as level
      from pg_class t
      join pg_namespace s on s.oid = t.relnamespace
      where relkind = 'r'
      and not exists (select *
      from pg_constraint
      where contype = 'f'
      and conrelid = t.oid)
      and s.nspname = '${namespace}'
      union all
      select ref.oid,
      ref.relname,
      rs.nspname,
      p.table_name,
      p.schema_name,
      p.level + 1
      from pg_class ref
      join pg_namespace rs on rs.oid = ref.relnamespace
      join pg_constraint c on c.contype = 'f' and c.conrelid = ref.oid
      join fk_tree p on p.reloid = c.confrelid
      where ref.oid != p.reloid),
      all_tables as (
      select schema_name, table_name, level, row_number() over (partition by schema_name, table_name order by level desc) as
      last_table_row from fk_tree )
      select table_name
      from all_tables at where last_table_row = 1 order by level DESC;`;
    }

    const publicResults = await this.knex.raw(_constructRawQuery('public'));
    const learningContentResults = await this.knex.raw(_constructRawQuery('learningcontent'));
    const pgbossResults = await this.knex.raw(_constructRawQuery('pgboss'));

    this.#tablesOrderedByDependency = [
      ...publicResults.rows.map(({ table_name }) => table_name),
      ...learningContentResults.rows.map(({ table_name }) => `learningcontent.${table_name}`),
      ...pgbossResults.rows.map(({ table_name }) => `pgboss.${table_name}`),
    ].filter((tableName) => !READONLY_TABLES.includes(tableName));

    this.#deletePriority = new Map(this.#tablesOrderedByDependency.map((tableName, index) => [tableName, index]));

    this.#insertPriority = new Map(
      this.#tablesOrderedByDependency.toReversed().map((tableName, index) => [tableName, index]),
    );
  }

  #addListeners() {
    this.knex?.on('query', (queryData) => {
      if (queryData.method?.toLowerCase() === 'insert') {
        const tableName = databaseHelpers.getTableNameFromInsertSqlQuery(queryData.sql);

        if (!tableName || tableName === '') return;
        if (tableName === 'pgboss.version') return;

        this.#dirtyTables.add(tableName);
      }
    });
  }
}
/* eslint-enable knex/avoid-injections */

function sanitizeTableName(tableName) {
  return tableName
    .split('.')
    .map((name) => `"${name}"`)
    .join('.');
}

function deleteFrom(tableName) {
  return `DELETE FROM ${sanitizeTableName(tableName)};`;
}
