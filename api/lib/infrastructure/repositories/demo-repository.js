const Demo = require('../../domain/models/Demo');
const demoDatasource = require('../datasources/airtable/demo-datasource');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(demoDataObject) {
  return new Demo({
    id: demoDataObject.id,
    type: 'DEMO',
    name: demoDataObject.name,
    description: demoDataObject.description,
    imageUrl: demoDataObject.imageUrl,
    challenges: demoDataObject.challenges,
    competences: demoDataObject.competences,
  });
}

module.exports = {

  get(id) {
    return demoDatasource.get(id).then(_toDomain);
  },

  getDemoName(id) {
    return this.get(id)
      .then((demo) => {
        return demo.name;
      })
      .catch(() => {
        throw new NotFoundError('Le test de démo demandé n\'existe pas');
      });
  }
};
