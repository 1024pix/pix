import Knex from 'knex';
import QueryBuilder from 'knex/lib/query/querybuilder.js';
import pg from 'pg';

import { config } from '../src/shared/config.js';
import { getInContext, getRequestId } from '../src/shared/infrastructure/execution-context-manager.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';
import { routeDomainToOwnerTeam } from '../src/shared/infrastructure/utils/route-domain-to-owner-team.js';

const types = pg.types;

export function configureGlobalExtensions() {
  /*
  By default, node-postgres casts a DATE value (PostgreSQL type) as a Date Object (JS type).
  But, when dealing with dates with no time (such as birthdate for example), we want to
  deal with a 'YYYY-MM-DD' string.
  */
  types.setTypeParser(types.builtins.DATE, (value) => value);

  /*
  The knex method count(), used with PostgreSQL, can sometimes return a BIGINT.
  This is not the common case (maybe in several years).
  Even though, Knex have decided to return String.
  We decided to parse the result of #count() method to force a resulting INTEGER.

  Links :
  - problem: https://github.com/bookshelf/bookshelf/issues/1275
  - solution: https://github.com/brianc/node-pg-types
   */
  types.setTypeParser(types.builtins.INT8, (value) => parseInt(value));

  const originalToSQL = QueryBuilder.prototype.toSQL;
  QueryBuilder.prototype.toSQL = function () {
    const ret = originalToSQL.apply(this);
    const request = getInContext('request');
    const teamsToContact = routeDomainToOwnerTeam(
      config.routeDomainToOwnerTeamMapping,
      request?.route?.realm?.plugin,
    ).join(',');
    ret.sql =
      `/* path:${request?.route?.path} | routeDomain:${request?.route?.realm?.plugin} | request_id:${getRequestId()} | teamsToContact:${teamsToContact} */ `.concat(
        ret.sql,
      );
    return ret;
  };
}

export function configureConnectionExtension(knex) {
  /* QueryBuilder Extension */
  try {
    Knex.QueryBuilder.extend('whereInArray', function (column, values) {
      return this.where(column, knex.raw('any(?)', [values]));
    });
  } catch (e) {
    if (e.message !== "Can't extend QueryBuilder with existing method ('whereInArray').") {
      logger.error(e);
    }
  }
}

export function disableTypeCastingForJsonTypes(knexConfig) {
  const JSON_OID = types.builtins.JSON;
  const JSONB_OID = types.builtins.JSONB;

  const originalAfterCreate = knexConfig.pool?.afterCreate;

  knexConfig.pool = {
    ...knexConfig.pool,
    afterCreate: (conn, done) => {
      conn.setTypeParser(JSON_OID, (val) => val);
      conn.setTypeParser(JSONB_OID, (val) => val);

      if (originalAfterCreate) {
        return originalAfterCreate(conn, done);
      }

      done(null, conn);
    },
  };
}
