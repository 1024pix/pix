import { CertifiedArea } from '../../../../lib/domain/read-models/CertifiedProfile';

const buildCertifiedArea = function buildCertifiedArea({
  id = 'someAreaId',
  name = 'someName',
  color = 'someColor',
} = {}) {
  return new CertifiedArea({
    id,
    name,
    color,
  });
};

export default buildCertifiedArea;
