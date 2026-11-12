import { AlgorithmEngineVersion } from '../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { databaseBuffer } from '../database-buffer.ts';

export function buildCertificationResult({
  id = databaseBuffer.getNextId(),
  version = AlgorithmEngineVersion.V3,
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
  takenAt = new Date('2026-01-01'),
  deliveredAt = new Date('2026-01-03'),
  status = 'cancelled',
  framework = 'CORE',
  franceCompetencesMinScore = 100,
  results = {},
} = {}) {
  const values = {
    id,
    version,
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
    takenAt,
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
