const _ = require('lodash');
const bluebird = require('bluebird');
const { NotFoundError, SameNationalStudentIdInOrganizationError, StudentsCouldNotBeSavedError } = require('../../domain/errors');
const StudentWithUserInfo = require('../../domain/models/StudentWithUserInfo');
const Student = require('../../domain/models/Student');

const Bookshelf = require('../bookshelf');
const BookshelfStudent = require('../data/student');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toStudentWithUserInfoDTO(BookshelfStudent) {

  const rawStudentWithUserInfo = BookshelfStudent.toJSON();

  return new StudentWithUserInfo({
    id: rawStudentWithUserInfo.id,
    firstName: rawStudentWithUserInfo.firstName,
    lastName: rawStudentWithUserInfo.lastName,
    birthdate: rawStudentWithUserInfo.birthdate,
    organizationId: rawStudentWithUserInfo.organizationId,
    username: rawStudentWithUserInfo.username,
    email: rawStudentWithUserInfo.email,
    isAuthenticatedFromGAR: (rawStudentWithUserInfo.samlId) ? true : false,
  });
}

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

  async addOrUpdateOrganizationStudents(studentDatas, organizationId) {
    const trx = await Bookshelf.knex.transaction();

    try {

      const students = _.map(studentDatas, (studentData) => new Student({ ...studentData, organizationId }));
      const studentsFromOrganization = await this.findByOrganizationId({ organizationId });
      const nationalStudentIdsFromOrganization = _.map(studentsFromOrganization, 'nationalStudentId');
      const [ studentsToUpdate, studentsToCreate ] = _.partition(students, (student) => _.includes(nationalStudentIdsFromOrganization, student.nationalStudentId));

      await bluebird.mapSeries(studentsToUpdate, async (studentToUpdate) => {
        await trx('students')
          .where({
            'organizationId': organizationId,
            'nationalStudentId': studentToUpdate.nationalStudentId,
          })
          .update(_.omit(studentToUpdate, ['id', 'createdAt']));
      });

      await Bookshelf.knex.batchInsert('students', studentsToCreate);

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new SameNationalStudentIdInOrganizationError(err.detail);
      }
      throw new StudentsCouldNotBeSavedError();
    }
  },

  findByOrganizationIdAndUserBirthdate({ organizationId, birthdate }) {
    return BookshelfStudent
      .query((qb) => {
        qb.where('organizationId', organizationId);
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
  },

  get(studentId) {
    return BookshelfStudent
      .where({ id: studentId })
      .fetch({ require: true })
      .then((student) => bookshelfToDomainConverter.buildDomainObject(BookshelfStudent, student))
      .catch((err) => {
        if (err instanceof BookshelfStudent.NotFoundError) {
          throw new NotFoundError(`Student not found for ID ${studentId}`);
        }
        throw err;
      });
  },

  findStudentsWithUserInfoByOrganizationId({ organizationId }) {
    return BookshelfStudent
      .where({ organizationId })
      .query((qb) => {
        qb.orderByRaw('LOWER(students."lastName") ASC, LOWER(students."firstName") ASC');
        qb.leftJoin('users', 'students.userId', 'users.id');
      })
      .fetchAll({ columns: ['students.id','students.firstName', 'students.lastName','students.birthdate', 'students.userId', 'students.organizationId' , 'users.username' , 'users.email' , 'users.samlId' , ] })
      .then((students) => students.models.map(_toStudentWithUserInfoDTO));
  },
};
