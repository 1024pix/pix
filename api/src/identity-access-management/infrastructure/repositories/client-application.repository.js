import Joi from 'joi';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { MissingClientApplicationScopesError } from '../../domain/errors.js';
import { ClientApplication } from '../../domain/models/ClientApplication.js';

const TABLE_NAME = 'client_applications';

export const clientApplicationRepository = {
  async findByClientId(clientId) {
    const knexConn = DomainTransaction.getConnection();
    const dto = await knexConn.select().from(TABLE_NAME).where({ clientId }).first();
    if (!dto) return undefined;
    return toDomain(dto);
  },

  async list() {
    const knexConn = DomainTransaction.getConnection();
    const dtos = await knexConn.select().from(TABLE_NAME).orderBy('name');
    return dtos.map((dto) => {
      const clientApplication = toDomain(dto);
      // eslint-disable-next-line no-unused-vars -- extract clientSecret so that it's not returned/displayed
      const { clientSecret, ...clientApplicationWithoutClientSecret } = clientApplication;
      return clientApplicationWithoutClientSecret;
    });
  },

  async create({ name, clientId, clientSecret, scopes, jurisdiction }) {
    const jurisdictionSchema = Joi.object({
      rules: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().valid('tags').required(),
            value: Joi.array().items(Joi.string()).required().min(1),
          }).required(),
        )
        .required()
        .min(1),
    });
    if (jurisdiction) {
      await jurisdictionSchema.validateAsync(jurisdiction);
    }
    const knexConn = DomainTransaction.getConnection();
    await knexConn.insert({ name, clientId, clientSecret, scopes, jurisdiction }).into(TABLE_NAME);
  },

  async removeByClientId(clientId) {
    const knexConn = DomainTransaction.getConnection();
    const rows = await knexConn.delete().from(TABLE_NAME).where({ clientId });
    return rows === 1;
  },

  async addScopes(clientId, newScopes) {
    return DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      const clientApplication = await knexConn
        .select('scopes')
        .from('client_applications')
        .where('clientId', clientId)
        .forUpdate()
        .first();

      if (!clientApplication) {
        return false;
      }

      const scopes = new Set(clientApplication.scopes);
      newScopes.forEach((scope) => scopes.add(scope));

      await knexConn('client_applications')
        .update({ scopes: Array.from(scopes), updatedAt: knexConn.fn.now() })
        .where('clientId', clientId);

      return true;
    });
  },

  async removeScopes(clientId, scopesToRemove) {
    return DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      const clientApplication = await knexConn
        .select('scopes')
        .from('client_applications')
        .where('clientId', clientId)
        .forUpdate()
        .first();

      if (!clientApplication) {
        return false;
      }

      const scopes = new Set(clientApplication.scopes);
      scopesToRemove.forEach((scope) => scopes.delete(scope));

      if (!scopes.size) {
        throw new MissingClientApplicationScopesError();
      }

      await knexConn('client_applications')
        .update({ scopes: Array.from(scopes), updatedAt: knexConn.fn.now() })
        .where('clientId', clientId);

      return true;
    });
  },

  async setClientSecret(clientId, clientSecret) {
    const knexConn = DomainTransaction.getConnection();
    const rows = await knexConn(TABLE_NAME).update({ clientSecret, updatedAt: knexConn.fn.now() }).where({ clientId });
    return rows === 1;
  },
};

function toDomain(dto) {
  return new ClientApplication(dto);
}
