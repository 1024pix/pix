import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Attestation } from '../../domain/models/Attestation.js';

export const findAll = async () => {
  const knexConnection = DomainTransaction.getConnection();
  const rows = await knexConnection('attestations').select('*');
  return rows.map((row) => new Attestation(row));
};

export const getByKey = async ({ attestationKey }) => {
  const knexConnection = DomainTransaction.getConnection();
  const attestation = await knexConnection('attestations').where({ key: attestationKey }).first();

  if (!attestation) return null;

  return new Attestation(attestation);
};

export const getDataByKey = async ({ key, attestationStorage }) => {
  const attestation = await getByKey({ attestationKey: key });

  if (!attestation) return null;

  const templateName = attestation.templateName + '.pdf';
  const { Body } = await attestationStorage.readFile({ key: templateName });
  return { Body, templateName };
};
