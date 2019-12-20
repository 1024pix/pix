const BookshelfStudent = require('../data/student');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const _ = require('lodash');
const bluebird = require('bluebird');

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

  async checkIfAtLeastOneStudentIsInOrganization({ nationalStudentIds, organizationId }) {
    const anyMatchingStudent = await BookshelfStudent
      .where('nationalStudentId', 'IN', nationalStudentIds)
      .where('organizationId', organizationId)
      .fetch({ columns: 'id' });
    return Boolean(anyMatchingStudent);
  },

  batchCreate(studentsToSave) {
    const bookshelfStudents = studentsToSave.map((studentToSave) => _.omit(studentToSave, ['id']));
    return Bookshelf.knex.batchInsert('students', bookshelfStudents).then(() => undefined);
  },

  async batchUpdateWithOrganizationId(studentsToUpdate, organizationId) {
    const trx = await Bookshelf.knex.transaction();

    return bluebird.map(studentsToUpdate, (studentToUpdate) => {
      return trx('students')
        .where({
          'organizationId': organizationId,
          'nationalStudentId': studentToUpdate.nationalStudentId
        })
        .update(_.omit(studentToUpdate, ['id', 'createdAt']));
    })
      .then(trx.commit)
      .catch(trx.rollback);
  },

  findNotLinkedYetByOrganizationIdAndUserBirthdate({ organizationId, birthdate }) {
    return BookshelfStudent
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.whereNull('userId');
        qb.where('birthdate', birthdate);
      })
      .fetchAll()
      .then((students) => bookshelfToDomainConverter.buildDomainObjects(BookshelfStudent, students));
  },

  associateUserAndStudent({ userId, studentId }) {
    return BookshelfStudent
      .where({ id: studentId })
      .save({ userId }, {
        patch: true,
      })
      .then((student) => bookshelfToDomainConverter.buildDomainObject(BookshelfStudent, student));
  },

  findOneByUserIdAndOrganizationId({ userId, organizationId }) {
    return BookshelfStudent
      .where({ userId, organizationId })
      .fetch()
      .then((student) => bookshelfToDomainConverter.buildDomainObject(BookshelfStudent, student));
  }
};
