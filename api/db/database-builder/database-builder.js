import _ from 'lodash';
import bluebird from 'bluebird';
import { factory } from './factory/index.js';
import { databaseBuffer } from './database-buffer.js';

class DatabaseBuilder {
  constructor({ knex, emptyFirst = true, beforeEmptyDatabase = () => undefined }) {
    this.knex = knex;
    this.databaseBuffer = databaseBuffer;
    this.tablesOrderedByDependencyWithDirtinessMap = [];
    this.factory = factory;
    this.isFirstCommit = true;
    this.emptyFirst = emptyFirst;
    this._beforeEmptyDatabase = beforeEmptyDatabase;

    this.#addListeners();
  }

  async commit() {
    if (this.isFirstCommit) {
      await this._init();
    }
    try {
      const trx = await this.knex.transaction();
      for (const objectToInsert of this.databaseBuffer.objectsToInsert) {
        await trx(objectToInsert.tableName).insert(objectToInsert.values);
        this._setTableAsDirty(objectToInsert.tableName);
      }
      await trx.commit();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Erreur dans databaseBuilder.commit() : ${err}`);
      this._purgeDirtiness();
      throw err;
    } finally {
      this.databaseBuffer.objectsToInsert = [];
    }
  }

  async clean() {
    let rawQuery = '';
    const tablesToDelete = this._selectDirtyTables();
    _.times(tablesToDelete.length, () => {
      rawQuery += 'DELETE FROM ??;';
    });
    if (rawQuery !== '') {
      await this.knex.raw(rawQuery, tablesToDelete);
    }
    this.databaseBuffer.purge();
    this._purgeDirtiness();
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
    const dirtyTables = this._selectDirtyTables();
    if (dirtyTables.length === 0) {
      return;
    }
    const dirtyTablesSequencesInfo = await this._getSequencesInfo(dirtyTables);

    return bluebird.mapSeries(dirtyTablesSequencesInfo, async ({ tableName, sequenceName }) => {
      const sequenceRestartAtNumber = (await this._getTableMaxId(tableName)) + 1;
      if (sequenceRestartAtNumber !== 0) {
        /* eslint-disable-next-line knex/avoid-injections */
        await this.knex.raw(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${sequenceRestartAtNumber};`);
      }
    });
  }

  async _getSequencesInfo(dirtyTables) {
    const database = this.knex.client.database();

    const rawSequencesInfo = await this.knex
      .from('information_schema.columns')
      .select('table_name', 'column_default')
      .whereRaw("column_default like 'nextval%'")
      .where({ table_catalog: database, column_name: 'id' })
      .whereIn('table_name', dirtyTables);

    const sequencesInfo = rawSequencesInfo.map(({ table_name, column_default }) => ({
      tableName: table_name,
      sequenceName: column_default.replaceAll('"', '').slice("nextval('".length, -"'::regclass)".length),
    }));
    return sequencesInfo;
  }

  async _getTableMaxId(tableName) {
    const { max } = await this.knex.from(tableName).max('id').first();
    return max;
  }

  async _init() {
    await this._initTablesOrderedByDependencyWithDirtinessMap();
    if (this.emptyFirst) {
      await this._emptyDatabase();
    }
    this.isFirstCommit = false;
  }

  async _emptyDatabase() {
    this._beforeEmptyDatabase();
    const sortedTables = _.without(
      _.map(this.tablesOrderedByDependencyWithDirtinessMap, 'table'),
      'knex_migrations',
      'knex_migrations_lock',
      'view-active-organization-learners',
    );
    const tables = _.map(sortedTables, (tableToDelete) => `"${tableToDelete}"`).join();
    // eslint-disable-next-line knex/avoid-injections
    return this.knex.raw(`TRUNCATE ${tables}`);
  }

  async _initTablesOrderedByDependencyWithDirtinessMap() {
    // See this link : https://stackoverflow.com/questions/51279588/sort-tables-in-order-of-dependency-postgres
    const results = await this.knex.raw(`with recursive fk_tree as (
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
      and s.nspname = 'public'
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
      join fk_tree p on p.reloid = c.confrelid ), all_tables as (
      select schema_name, table_name, level, row_number() over (partition by schema_name, table_name order by level desc) as
      last_table_row from fk_tree )
      select table_name
      from all_tables at where last_table_row = 1 order by level DESC;`);

    this.tablesOrderedByDependencyWithDirtinessMap = _.map(results.rows, ({ table_name }) => {
      return {
        table: table_name,
        isDirty: false,
      };
    });
  }

  _setTableAsDirty(table) {
    const tableWithDirtiness = _.find(this.tablesOrderedByDependencyWithDirtinessMap, { table });
    if (tableWithDirtiness) tableWithDirtiness.isDirty = true;
  }

  _selectDirtyTables() {
    const dirtyTableObjects = _.filter(this.tablesOrderedByDependencyWithDirtinessMap, { isDirty: true });
    return _.map(dirtyTableObjects, 'table');
  }

  _purgeDirtiness() {
    _.each(this.tablesOrderedByDependencyWithDirtinessMap, (table) => {
      table.isDirty = false;
    });
  }

  #addListeners() {
    this.knex?.on('query', (queryData) => {
      {
        if (queryData.method?.toLowerCase() === 'insert') {
          const tableNameRegExp = /insert into "(?<tableName>(?:\\.|[^"\\])*)"/g;
          const tableName = tableNameRegExp.exec(queryData.sql)?.groups?.tableName;

          if (!_.isEmpty(tableName)) {
            this._setTableAsDirty(tableName);
          }
        }
      }
    });
  }
}

export { DatabaseBuilder };
