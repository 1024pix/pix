import Joi from 'joi';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
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
      // oxlint-disable-next-line no-unused-vars -- extract clientSecret so that it's not returned/displayed
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

  async save(clientApplication) {
    const knexConn = DomainTransaction.getConnection();
    const updated = await knexConn('client_applications')
      .update({ ...toDto(clientApplication), updatedAt: knexConn.fn.now() })
      .where('id', clientApplication.id);

    return updated === 1;
  },

  async removeByClientId(clientId) {
    const knexConn = DomainTransaction.getConnection();
    const rows = await knexConn.delete().from(TABLE_NAME).where({ clientId });
    return rows === 1;
  },
};

function toDomain(dto) {
  return new ClientApplication(dto);
}

function toDto(model) {
  return {
    name: model.name,
    clientSecret: model.clientSecret,
    scopes: model.scopes,
    jurisdiction: model.jurisdiction,
  };
}
