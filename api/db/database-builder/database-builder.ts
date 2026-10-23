/* eslint-disable knex/avoid-injections */
import type { Knex } from 'knex';

import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import type { DatabaseConnection } from '../database-connection.js';
import { type DatabaseBuffer, databaseBuffer as defaultDatabaseBuffer } from './database-buffer.ts';
import * as databaseHelpers from './database-helpers.js';
import { factory } from './factory/index.ts';

const READONLY_TABLES = [
  'knex_migrations',
  'knex_migrations_lock',
  'view-active-organization-learners',
  'pgboss.version',
];
const CHUNK_SIZE = 1000;

type DatabaseBuilderOptions = {
  databaseConnection: DatabaseConnection;
  emptyFirst?: boolean;
  databaseBuffer?: DatabaseBuffer;
};

type SequenceInfo = { tableName: string; sequenceName: string };

export class DatabaseBuilder {
  #databaseConnection: DatabaseConnection;
  #emptyFirst: boolean;
  #databaseBuffer: DatabaseBuffer;

  #isFirstCommit = true;

  #tablesOrderedByDependency: string[] | undefined;
  #insertPriority = new Map<string, number>();
  #deletePriority = new Map<string, number>();
  #dirtyTables = new Set<string>();

  knex: Knex;
  factory: typeof factory;

  constructor({
    databaseConnection,
    emptyFirst = true,
    databaseBuffer = defaultDatabaseBuffer,
  }: DatabaseBuilderOptions) {
    this.#databaseConnection = databaseConnection;
    // The not-configured stub is only reachable when isConfigured is false, in which case nothing queries the database.
    this.knex = databaseConnection.knex as Knex;
    this.factory = factory;
    this.#databaseBuffer = databaseBuffer;
    this.#emptyFirst = emptyFirst;

    if (this.#databaseConnection.isConfigured) this.#addListeners();
  }

  static create({ databaseConnection, emptyFirst = true }: DatabaseBuilderOptions): Promise<DatabaseBuilder> {
    return Promise.resolve(new DatabaseBuilder({ databaseConnection, emptyFirst }));
  }

  async commit(): Promise<void> {
    await this.#init();

    const orderedObjectsToInsert = Object.entries(this.#databaseBuffer.objectsToInsert).toSorted(
      ([tableName1], [tableName2]) =>
        priorityOf(this.#insertPriority, tableName1) - priorityOf(this.#insertPriority, tableName2),
    );

    try {
      await this.knex.transaction(async (trx) => {
        for (const [tableName, objectsToInsert] of orderedObjectsToInsert) {
          for (const chunk of toChunks(objectsToInsert, CHUNK_SIZE)) {
            await trx.insert(chunk).into(tableName);
          }
          this.#dirtyTables.add(tableName);
        }
      });
    } catch (err) {
      logger.error(`Erreur dans databaseBuilder.commit() : ${String(err)}`);
      this.#dirtyTables.clear();
      throw err;
    } finally {
      this.#databaseBuffer.objectsToInsert = {};
    }
  }

  async clean(): Promise<void> {
    if (this.#dirtyTables.size) {
      await this.knex.raw(
        Array.from(this.#dirtyTables)
          .toSorted(
            (tableName1, tableName2) =>
              priorityOf(this.#deletePriority, tableName1) - priorityOf(this.#deletePriority, tableName2),
          )
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
  async fixSequences(): Promise<void> {
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

  async #getDirtyTablesSequencesInfo(): Promise<SequenceInfo[]> {
    const database = this.#databaseConnection.databaseName;

    const rawSequencesInfo = await this.knex
      .from('information_schema.columns')
      .select<{ table_name: string; column_default: string }[]>('table_name', 'column_default')
      .whereRaw("column_default like 'nextval%'")
      .where({ table_catalog: database, column_name: 'id' })
      .whereIn('table_name', Array.from(this.#dirtyTables));

    const sequencesInfo = rawSequencesInfo.map(({ table_name, column_default }) => ({
      tableName: table_name,
      sequenceName: column_default.replaceAll('"', '').slice("nextval('".length, -"'::regclass)".length),
    }));
    return sequencesInfo;
  }

  async #getTableMaxId(tableName: string): Promise<number> {
    const row = await this.knex.from(tableName).max('id').first<{ max: number | null } | undefined>();
    return row?.max ?? 0;
  }

  async #init(): Promise<void> {
    if (!this.#isFirstCommit) return;
    await this.#loadTables();
    if (this.#emptyFirst) {
      await this.emptyDatabase();
    }
    this.#isFirstCommit = false;
  }

  async emptyDatabase({ keepLearningContent = false }: { keepLearningContent?: boolean } = {}): Promise<void> {
    // Can be called before #init() has loaded the tables (initial test cleanup)
    const tablesOrderedByDependency = this.#tablesOrderedByDependency ?? (await this.#loadTables());

    const sortedTableNames = tablesOrderedByDependency
      .map(sanitizeTableName)
      .filter((tableName) => {
        return keepLearningContent ? !tableName.includes('learningcontent') : true;
      })
      .join(',');
    await this.knex.raw(`TRUNCATE ${sortedTableNames}`);
  }

  async #loadTables(): Promise<string[]> {
    // See this link : https://stackoverflow.com/questions/51279588/sort-tables-in-order-of-dependency-postgres
    const constructRawQuery = (namespace: string): string => {
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
    };

    const publicResults = await this.knex.raw<TableNamesResult>(constructRawQuery('public'));
    const learningContentResults = await this.knex.raw<TableNamesResult>(constructRawQuery('learningcontent'));

    this.#tablesOrderedByDependency = [
      ...publicResults.rows.map(({ table_name }) => table_name),
      ...learningContentResults.rows.map(({ table_name }) => `learningcontent.${table_name}`),
    ].filter((tableName) => !READONLY_TABLES.includes(tableName));

    this.#deletePriority = new Map(this.#tablesOrderedByDependency.map((tableName, index) => [tableName, index]));

    this.#insertPriority = new Map(
      this.#tablesOrderedByDependency.toReversed().map((tableName, index) => [tableName, index]),
    );

    return this.#tablesOrderedByDependency;
  }

  #addListeners(): void {
    this.knex?.on('query', (queryData: { method?: string; sql: string }) => {
      if (queryData.method?.toLowerCase() === 'insert') {
        const tableName = databaseHelpers.getTableNameFromInsertSqlQuery(queryData.sql);

        if (!tableName || tableName === '') return;
        if (tableName === 'db_type_parsing_test') return;
        if (tableName === 'batch_update_test') return;

        this.#dirtyTables.add(tableName);
      }
    });
  }
}
/* eslint-enable knex/avoid-injections */

type TableNamesResult = { rows: { table_name: string }[] };

const priorityOf = (priorities: Map<string, number>, tableName: string): number => priorities.get(tableName) ?? 0;

const toChunks = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));

const sanitizeTableName = (tableName: string): string =>
  tableName
    .split('.')
    .map((name) => `"${name}"`)
    .join('.');

const deleteFrom = (tableName: string): string => `DELETE FROM ${sanitizeTableName(tableName)};`;
