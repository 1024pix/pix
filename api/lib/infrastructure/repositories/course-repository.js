const Course = require('../../domain/models/Demo');
const courseDatasource = require('../datasources/airtable/demo-datasource');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(courseDataObject) {
  return new Course({
    id: courseDataObject.id,
    type: courseDataObject.adaptive ? 'PLACEMENT' : 'DEMO',
    name: courseDataObject.name,
    description: courseDataObject.description,
    imageUrl: courseDataObject.imageUrl,
    challenges: courseDataObject.challenges,
    competences: courseDataObject.competences,
  });
}

module.exports = {

  get(id) {
    return courseDatasource.get(id).then(_toDomain);
  },

  getCourseName(id) {
    return this.get(id)
      .then((course) => {
        return course.name;
      })
      .catch(() => {
        throw new NotFoundError('Le test demandé n\'existe pas');
      });
  }
};
