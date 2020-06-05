const os = require('os');
const util = require('util');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const Joi = require('joi');
const _ = require('lodash');
const { BadRequestError } = require('../http-errors');
const { EntityValidationError } = require('../../domain/errors');
const { QUERY, SPLIT_MARKER } = require('../../infrastructure/utils/sql/query-profile-copy');
const { system } = require('../../config');

const copyProfileParamsSchema = Joi.object({
  srcUserId: Joi.number().integer().required(),
  destUserId: Joi.number().integer().required(),
  destOrganizationId: Joi.number().integer().required(),
  destCreatorId: Joi.number().integer().required(),
  destCertificationCenterId: Joi.number().integer().required(),
  srcDatabaseUrl: Joi.string().required(),
  destDatabaseUrl: Joi.string().required(),
});

const baseDbConfig = {
  client: 'postgresql',
  pool: {
    min: 1,
    max: 4,
  },
};

async function getDBClient(databaseUrl) {
  const config = _.clone(baseDbConfig);
  config.connection = databaseUrl;
  const dbClient = require('knex')(config);
  // Ping
  try {
    await dbClient.raw('SELECT * FROM ??', ['pix_roles']);
  } catch (err) {
    throw new BadRequestError(`${databaseUrl} n'existe pas ou bien est impossible à contacter`);
  }

  return dbClient;
}

async function killDBClient(dbClient) {
  return dbClient.destroy();
}

async function copyFromDB(databaseUrl, data) {
  const completedQuery = util.format(QUERY, data.destUserId, data.srcUserId, data.destOrganizationId, data.destCreatorId, data.destCertificationCenterId);
  let dbClient;
  let results;
  try {
    dbClient = await getDBClient(databaseUrl);
    results = await dbClient.transaction(async (trx) => {
      return trx.raw(completedQuery);
    });
  } catch (err) {
    if (err instanceof BadRequestError) {
      throw new BadRequestError(`Erreur de la copie depuis la base source : ${err.message}.`);
    }
    throw err;
  } finally {
    if (dbClient) {
      await killDBClient(dbClient);
    }
  }

  const result = _.last(results);
  if (result && result.rows && result.rows[0] && result.rows[0]['query_to_execute']) {
    return _.last(results).rows[0]['query_to_execute'];
  }

  throw new BadRequestError(`Erreur de la copie depuis la base source : aucune donnée à copier depuis ${databaseUrl}.`);
}

async function pasteToDB(databaseUrl, query) {
  let dbClient;
  try {
    dbClient = await getDBClient(databaseUrl);
    const queryParts = _.split(query, SPLIT_MARKER);
    await dbClient.transaction(async (trx) => {
      for (const queryPart of queryParts) {
        await trx.raw(queryPart);
      }
    });
  } catch (err) {
    if (err instanceof BadRequestError) {
      throw new BadRequestError(`Erreur du collage vers la base destination : ${err.message}.`);
    }
    throw err;
  } finally {
    if (dbClient) {
      await killDBClient(dbClient);
    }
  }
}

module.exports = {

  async generateAndDownloadHeapDump(request, h) {
    if (!os.hostname().endsWith(request.params.hostname)) {
      return h.redirect(request.path);
    }

    const writeHeapDump = util.promisify(heapdump.writeSnapshot);
    const filename = await writeHeapDump();
    return h.file(filename, { mode: 'attachment' });
  },

  async generateAndDownloadHeapProfile(request, h) {
    if (!system.samplingHeapProfilerEnabled) {
      return h.response('Heap profile sampling is not enabled').code(404);
    }

    if (!os.hostname().endsWith(request.params.hostname)) {
      return h.redirect(request.path);
    }

    const filename = await heapProfile.write();
    return h.file(filename, { mode: 'attachment' });
  },

  async copyProfile(request) {
    const {
      srcDatabaseUrl,
      destDatabaseUrl,
    } = request.payload;
    const data = _.pick(request.payload, ['srcUserId', 'destUserId', 'destOrganizationId', 'destCreatorId', 'destCertificationCenterId', 'srcDatabaseUrl', 'destDatabaseUrl']);

    const { error } = copyProfileParamsSchema.validate(data);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }

    const queryToExecute = await copyFromDB(srcDatabaseUrl, data);
    await pasteToDB(destDatabaseUrl, queryToExecute);

    return null;
  }
};
