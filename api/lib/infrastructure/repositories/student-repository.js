const BookshelfStudent = require('../data/student');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const _ = require('lodash');

module.exports = {

  findByOrganizationId({ organizationId }) {
    return BookshelfStudent
      .where({ organizationId })
      .query((qb) => {
        qb.orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC');
      })
      .fetchAll()
      .then((students) => bookshelfToDomainConverter.buildDomainObjects(BookshelfStudent, students));
  },

  checkIfAtLeastOneStudentHasAlreadyBeenImported(nationalStudentsIds) {
    return BookshelfStudent
      .where('nationalStudentId', 'IN', nationalStudentsIds)
      .fetchAll()
      .then((alreadyImportedStudents) => bookshelfToDomainConverter.buildDomainObjects(BookshelfStudent, alreadyImportedStudents))
      .then((alreadyImportedStudents) => !_.isEmpty(alreadyImportedStudents));
  },

  batchSave(studentsToSave) {
    const bookshelfStudents = studentsToSave.map((studentToSave) => _.omit(studentToSave, ['id']));
    return Bookshelf.knex.batchInsert('students', bookshelfStudents).then(() => undefined);
  },

  isThereAtLeastOneMatchForTheUserInStudentList({ user, organizationId }) {
    return BookshelfStudent
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.whereRaw('LOWER(?) in (LOWER(??), LOWER(??), LOWER(??))', [user.firstName, 'firstName', 'middleName', 'thirdName']);
        qb.whereRaw('LOWER(?) in (LOWER(??), LOWER(??))', [user.lastName, 'lastName', 'preferredLastName']);
        qb.count();
      })
      .fetch()
      .then((countStudents) => {
        return parseInt(countStudents.attributes.count) === 1;
      });
  }
};
