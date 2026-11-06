import { randomUUID } from 'node:crypto';

import { databaseBuffer } from '../database-buffer.ts';

export function buildCertificationResult({
  id,
  firstName = 'first-name',
  middleName = 'middle-name',
  thirdName = 'third-name',
  lastName = 'last-name',
  externalId = 'externalId',
  nationalStudentId = 'nationalStudentId',
  birthdate = '2001-05-21',
  birthplace = 'Paris',
  birthPostalCode = '66000',
  birthINSEECode = null,
  birthCountry = 'FRANCE',
  verificationCode = 'VERIFCODE',
  certificationCenter = 'Meilleur centre de certif',
  deliveredAt = new Date('2026-01-03'),
  status = 'cancelled',
  framework = 'CORE',
  franceCompetencesMinScore = 100,
  results = {},
} = {}) {
  id = id === undefined ? randomUUID() : id;

  const values = {
    id,
    firstName,
    middleName,
    thirdName,
    lastName,
    externalId,
    nationalStudentId,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    verificationCode,
    certificationCenter,
    deliveredAt,
    status,
    framework,
    franceCompetencesMinScore,
    results: JSON.stringify(results),
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification_results',
    values,
  });
}
