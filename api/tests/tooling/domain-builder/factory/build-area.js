const Area = require('../../../../lib/domain/models/Area');

module.exports = function buildArea({
  id = 'recArea123',
  code = 5,
  title = 'Super domaine',
  competences = [],
  color = 'red',
  name,
  frameworkId = 'recFmk123',
} = {}) {
  name = name || `${code}. ${title}`;
  return new Area({
    id,
    name,
    code,
    title,
    competences,
    color,
    frameworkId,
  });
};
