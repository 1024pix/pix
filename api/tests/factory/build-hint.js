const Hint = require('../../lib/domain/models/Hint');

module.exports = function({
  skillName = '@web2',
  value = 'Pense à regarder les indices',
} = {}) {
  return new Hint({
    skillName,
    value
  });
};

