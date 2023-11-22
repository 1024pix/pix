import { ComplementaryCertification } from '../../../lib/domain/models/ComplementaryCertification.js';
import { databaseBuffer } from '../database-buffer.js';

function buildComplementaryCertification({
  id = databaseBuffer.getNextId(),
  label = 'UneSuperCertifComplémentaire',
  key = 'SUPERCERTIF',
  createdAt = new Date('2020-01-01'),
  minimumReproducibilityRate = 70.0,
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
    hasComplementaryReferential,
    hasExternalJury,
    certificationExtraTime,
  });
};

buildComplementaryCertification.droit = function ({
  id = databaseBuffer.getNextId(),
  minimumReproducibilityRate = 75,
  hasComplementaryReferential = false,
  hasExternalJury = false,
  certificationExtraTime = 45,
}) {
  return buildComplementaryCertification({
    id,
    label: 'Pix+ Droit',
    key: ComplementaryCertification.PIX_PLUS_DROIT,
    createdAt: new Date('2020-01-01'),
    minimumReproducibilityRate,
    hasComplementaryReferential,
    hasExternalJury,
    certificationExtraTime,
  });
};

buildComplementaryCertification.pixEdu1erDegre = function ({
  id = databaseBuffer.getNextId(),
  minimumReproducibilityRate = 70,
  hasComplementaryReferential = false,
  hasExternalJury = true,
  certificationExtraTime = 45,
}) {
  return buildComplementaryCertification({
    id,
    label: 'Pix+ Édu 1er degré',
    key: ComplementaryCertification.PIX_PLUS_EDU_1ER_DEGRE,
    createdAt: new Date('2020-01-01'),
    minimumReproducibilityRate,
    hasComplementaryReferential,
    hasExternalJury,
    certificationExtraTime,
  });
};

buildComplementaryCertification.pixEdu2ndDegre = function ({
  id = databaseBuffer.getNextId(),
  minimumReproducibilityRate = 70,
  hasComplementaryReferential = false,
  hasExternalJury = true,
  certificationExtraTime = 45,
}) {
  return buildComplementaryCertification({
    id,
    label: 'Pix+ Édu 2nd degré',
    key: ComplementaryCertification.PIX_PLUS_EDU_2ND_DEGRE,
    createdAt: new Date('2020-01-01'),
    minimumReproducibilityRate,
    hasComplementaryReferential,
    hasExternalJury,
    certificationExtraTime,
  });
};

export { buildComplementaryCertification };
