import { ComplementaryCertification } from '../../../lib/shared/domain/models/ComplementaryCertification.js';
import { databaseBuffer } from '../database-buffer.js';

function buildComplementaryCertification({
  id = databaseBuffer.getNextId(),
  label = 'UneSuperCertifComplémentaire',
  key = 'SUPERCERTIF',
  createdAt = new Date('2020-01-01'),
  minimumReproducibilityRate = 70.0,
  minimumEarnedPix,
  hasComplementaryReferential = false,
  hasExternalJury = false,
  certificationExtraTime = 45,
} = {}) {
  const values = {
    id,
    label,
    key,
    createdAt,
    minimumReproducibilityRate,
    minimumEarnedPix,
    hasComplementaryReferential,
    hasExternalJury,
    certificationExtraTime,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certifications',
    values,
  });
}

buildComplementaryCertification.clea = function ({
  id = databaseBuffer.getNextId(),
  minimumReproducibilityRate = 50.0,
  minimumEarnedPix = 70,
  hasComplementaryReferential = false,
  hasExternalJury = false,
  certificationExtraTime = 0,
}) {
  return buildComplementaryCertification({
    id,
    label: 'CléA Numérique',
    key: ComplementaryCertification.CLEA,
    createdAt: new Date('2020-01-01'),
    minimumReproducibilityRate,
    minimumEarnedPix,
    hasComplementaryReferential,
    hasExternalJury,
    certificationExtraTime,
  });
};

export { buildComplementaryCertification };
