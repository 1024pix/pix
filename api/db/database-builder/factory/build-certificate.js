import { AlgorithmEngineVersion } from '../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { databaseBuffer } from '../database-buffer.ts';

export function buildCertificate({
  id = databaseBuffer.getNextId(),
  version = AlgorithmEngineVersion.V3,
  userId = null,
  firstName = 'first-name',
  middleName = 'middle-name',
  thirdName = 'third-name',
  lastName = 'last-name',
  externalId = 'externalId',
  birthdate = '2001-05-21',
  birthplace = 'Paris',
  verificationCode = 'VERIFCODE',
  certificationCenter = 'Meilleur centre de certif',
  takenAt = new Date('2026-01-01'),
  deliveredAt = new Date('2026-01-03'),
  status = 'cancelled',
  versionId = null,
  framework = 'CORE',
  franceCompetencesMinScore = 100,
  results = {},
} = {}) {
  const values = {
    id,
    version,
    userId,
    firstName,
    middleName,
    thirdName,
    lastName,
    externalId,
    birthdate,
    birthplace,
    verificationCode,
    certificationCenter,
    takenAt,
    deliveredAt,
    status,
    versionId,
    framework,
    franceCompetencesMinScore,
    results: JSON.stringify(results),
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certificates',
    values,
  });
}
