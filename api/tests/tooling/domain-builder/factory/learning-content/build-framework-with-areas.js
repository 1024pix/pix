import { FrameworkWithAreas } from '../../../../../src/learning-content/domain/models/FrameworkWithAreas.js';

export function buildFramework({ id = 'frameworkPix', name = 'Pix', areas = [] } = {}) {
  return new FrameworkWithAreas({
    id,
    name,
    areas,
  });
}
