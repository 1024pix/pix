import ComplementaryCertification from '../../../../lib/domain/models/ComplementaryCertification';

export default function buildComplementaryCertification({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
  });
}
