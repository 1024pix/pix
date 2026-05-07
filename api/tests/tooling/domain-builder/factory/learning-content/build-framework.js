import { Framework } from '../../../../../src/learning-content/domain/models/Framework.js';

export function buildFramework({ id = 'frameworkPix', name = 'Pix' } = {}) {
  return new Framework({
    id,
    name,
  });
}
