const Area = require('../../../../lib/domain/models/Area');

module.exports = function buildArea({
  id = 'recArea123',
  code = 5,
  title = 'Super domaine',
  competences = [],
  color = 'red',
  name,
  frameworkId = 'recFmk123',
  framework = { id: 'recFmk123', name: 'PIX' },
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
    framework,
  });
  competences.forEach((competence) => {
    competence.area = area;
  });
  return area;
};
