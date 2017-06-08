const Serie = require('../../../lib/domain/models/referential/serie');

module.exports = {

  list() {

    const series = [
      new Serie({ id: 'serie1' }),
      new Serie({ id: 'serie2' }),
      new Serie({ id: 'serie3' })
    ];
    return series;
  }
};
