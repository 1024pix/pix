const Course = require('../../domain/models/Course');
const courseDatasource = require('../datasources/airtable/course-datasource');
const AirtableResourceNotFound = require('../datasources/airtable/AirtableResourceNotFound');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(courseDataObject) {
  return new Course({
    id: courseDataObject.id,
    name: courseDataObject.name,
    description: courseDataObject.description,
    imageUrl: courseDataObject.imageUrl,
    challenges: courseDataObject.challenges,
    competences: courseDataObject.competences,
  });
}

module.exports = {

  async get(id) {
    try {
      const courseDataObject = await courseDatasource.get(id);
      return _toDomain(courseDataObject);
    }
    catch (error) {
      if (error instanceof AirtableResourceNotFound) {
        throw new NotFoundError();
      }
      throw error;
    }
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
