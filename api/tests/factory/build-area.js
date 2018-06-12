const Area = require('../../lib/domain/models/Area');

module.exports = function buildArea({
  id = 'recvoGdo7z2z7pXWa',
  code = '1',
  name = '1. Information et données',
  title = 'Information et données',
  competences,
} = {}) {

  return new Area({
    id,
    code,
    name,
    title,
    competences,
  });
};
