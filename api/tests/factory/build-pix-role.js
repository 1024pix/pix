const PixRole = require('../../lib/domain/models/PixRole');

module.exports = function buildPixRole({ id = 1, name = 'PIX-MASTER' } = {}) {
  return new PixRole({ id, name });
};
