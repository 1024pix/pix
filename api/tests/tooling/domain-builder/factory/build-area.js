import { Area } from '../../../../lib/domain/models/Area.js';

const buildArea = function ({
  id = 'recArea123',
  code = 5,
  title = 'Super domaine',
  competences = [],
  color = 'red',
  name,
  frameworkId = 'recFmk123',
} = {}) {
  name = name || `${code}. ${title}`;
  const area = new Area({
    id,
    name,
    code,
    title,
    competences,
    color,
    frameworkId,
  });
  competences.forEach((competence) => {
    competence.area = area;
  });
  return area;
};

export { buildArea };
