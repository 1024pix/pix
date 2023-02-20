import ComplementaryCertification from '../../../lib/domain/models/ComplementaryCertification';
import databaseBuffer from '../database-buffer';

function buildComplementaryCertification({
  id = databaseBuffer.getNextId(),
  label = 'UneSuperCertifComplémentaire',
  key = 'SUPERCERTIF',
  createdAt = new Date('2020-01-01'),
  minimumReproducibilityRate = 70.0,
  minimumEarnedPix,
  hasComplementaryReferential = false,
  hasExternalJury = false,
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
  });
};

export default buildComplementaryCertification;
