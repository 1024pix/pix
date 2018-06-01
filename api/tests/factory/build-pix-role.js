const PixRole = require('../../lib/domain/models/PixRole');

module.exports = function({ id = 1, name = 'PIX-MASTER' } = {}) {
  return new PixRole({ id, name });
};

