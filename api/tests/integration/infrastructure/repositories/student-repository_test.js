const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const Student = require('../../../../lib/domain/models/Student');

describe('Integration | Infrastructure | Repository | student-repository', () => {

  describe('#findByOrganizationId', () => {

    it('should return instances of Student', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const student = databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        userId: null,
      });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      const anyStudent = students[0];
      expect(anyStudent).to.be.an.instanceOf(Student);

      expect(anyStudent.firstName).to.equal(student.firstName);
      expect(anyStudent.lastName).to.equal(student.lastName);
      expect(anyStudent.birthdate).to.deep.equal(student.birthdate);
    });

    it('should return all the students for a given organization ID', async () => {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const student_1 = databaseBuilder.factory.buildStudent({ organizationId: organization_1.id });
      const student_2 = databaseBuilder.factory.buildStudent({ organizationId: organization_1.id, userId: user.id });
      databaseBuilder.factory.buildStudent({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findByOrganizationId({ organizationId: organization_1.id });

      // then
      expect(_.map(students, 'id')).to.have.members([student_1.id, student_2.id]);
    });

    it('should order students by lastName and then by firstName with no sensitive case', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const student_1 = databaseBuilder.factory.buildStudent({ organizationId: organization.id, lastName: 'Grenier' });
      const student_2 = databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Xavier'
      });
      const student_3 = databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Arthur'
      });
      const student_4 = databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'MATHURIN'
      });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      expect(_.map(students, 'id')).to.deep.include.ordered.members([student_3.id, student_4.id, student_2.id, student_1.id]);
    });
  });

  describe('#checkIfAtLeastOneStudentHasAlreadyBeenImported', () => {

    it('should not find any student if none match both organizationId and nationalStudentId', async () => {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildStudent({
        organizationId: otherOrganizationId,
        userId: null,
        nationalStudentId: 'INE',
      });

      await databaseBuilder.commit();

      // when
      const result = await studentRepository.checkIfAtLeastOneStudentIsInOrganization({ nationalStudentIds: ['INE'], organizationId });

      // then
      expect(result).to.be.false;
    });

    it('should find at least a student matching with organizationId and nationalStudentId', async () => {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const student = databaseBuilder.factory.buildStudent({
        organizationId,
        userId: null,
        nationalStudentId: 'BTDY53Y68',
      });
      databaseBuilder.factory.buildStudent({
        organizationId,
        userId: null,
        nationalStudentId: '67482FBEH',
      });

      await databaseBuilder.commit();

      // when
      const result = await studentRepository.checkIfAtLeastOneStudentIsInOrganization({ nationalStudentIds: ['WRONG123', student.nationalStudentId], organizationId });

      // then
      expect(result).to.be.true;
    });
  });

  describe('#batchSave', () => {

    afterEach(() => {
      return knex('students').delete();
    });

    it('should save all students', async function() {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const student_1 = {
        firstName: 'Lucy',
        lastName: 'Handmade',
        birthdate: '1990-12-31',
        organizationId: organization.id
      };
      const student_2 = {
        firstName: 'Harry',
        lastName: 'Covert',
        birthdate: '1990-01-01',
        organizationId: organization.id
      };
      const studentsToSave = [student_1, student_2];

      // when
      await studentRepository.batchSave(studentsToSave);

      // then
      const students = await knex('students').where({ organizationId: organization.id });
      expect(students).to.have.lengthOf(2);
      expect(_.map(students, 'firstName')).to.have.members([student_1.firstName, student_2.firstName]);
    });
  });

  describe('#findNotLinkedYetByOrganizationIdAndUserBirthdate', () => {

    afterEach(() => {
      return knex('students').delete();
    });

    let organization;

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        userId: null,
        preferredLastName: 'Lee',
        lastName: 'Lieber',
        firstName: 'Stanley',
        middleName: 'Martin',
        thirdName: 'Stan',
        birthdate: '2000-03-31',
      });
      databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        userId: null,
        lastName: 'See',
        firstName: 'Johnny',
        birthdate: '2000-03-31',
      });
      await databaseBuilder.commit();
    });

    it('should return found students', async () => {
      // given
      const user = { firstName: 'Sttan', lastName: 'Lee', birthdate: '2000-03-31' };

      // when
      const result = await studentRepository.findNotLinkedYetByOrganizationIdAndUserBirthdate({
        organizationId: organization.id, birthdate: user.birthdate
      });

      // then
      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(2);
    });

    it('should return empty array with wrong birthdate', async () => {
      // given
      const user = { firstName: 'Sttan', lastName: 'Lee', birthdate: '2001-03-31' };

      // when
      const result = await studentRepository.findNotLinkedYetByOrganizationIdAndUserBirthdate({
        organizationId: organization.id, birthdate: user.birthdate
      });

      // then
      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array with fake organizationId', async () => {
      // given
      const user = { firstName: 'Sttan', lastName: 'Lee', birthdate: '2000-03-31' };

      // when
      const result = await studentRepository.findNotLinkedYetByOrganizationIdAndUserBirthdate({
        organizationId: '999', birthdate: user.birthdate
      });

      // then
      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array when userId is not null', async () => {
      // given
      databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        lastName: 'See',
        firstName: 'Johnny',
        birthdate: '1999-05-05',
      });
      await databaseBuilder.commit();
      const user = { firstName: 'Sttan', lastName: 'Lee', birthdate: '1999-05-05' };

      // when
      const result = await studentRepository.findNotLinkedYetByOrganizationIdAndUserBirthdate({
        organizationId: '999', birthdate: user.birthdate
      });

      // then
      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(0);
    });
  });

  describe('#associateUserAndStudent', () => {

    afterEach(() => {
      return knex('students').delete();
    });

    let organization;
    let student;
    let user;

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
      student = databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        userId: null,
        firstName: 'Steeve',
        lastName: 'Roger'
      });
      user = databaseBuilder.factory.buildUser({ firstName: 'Steeve', lastName: 'Roger' });
      await databaseBuilder.commit();
    });

    it('should save association between user and student', async () => {
      // when
      const studentPatched = await studentRepository.associateUserAndStudent({ userId: user.id, studentId: student.id });

      // then
      expect(studentPatched).to.be.instanceof(Student);
      expect(studentPatched.userId).to.equal(user.id);
    });

    it('should return an error when we don’t find the student to update', async () => {
      // given
      const fakeStudentId = 1;

      // when
      const error = await catchErr(studentRepository.associateUserAndStudent)({ userId: user.id, studentId: fakeStudentId });

      // then
      expect(error.message).to.be.equal('No Rows Updated');
    });

    it('should return an error when the userId to link don’t match a user', async () => {
      // given
      const fakeUserId = 1;

      // when
      const error = await catchErr(studentRepository.associateUserAndStudent)({
        userId: fakeUserId,
        studentId: student.id
      });

      // then
      expect(error.detail).to.be.equal(`Key (userId)=(${fakeUserId}) is not present in table "users".`);
    });
  });

  describe('#getByUserId', () => {

    it('should return instance of Student linked to the given userId', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildStudent({ organizationId: organization.id, userId, });

      await databaseBuilder.commit();

      // when
      const student = await studentRepository.getByUserId({ userId });

      // then
      expect(student).to.be.an.instanceOf(Student);
      expect(student.userId).to.equal(userId);
    });

    it('should return null if there is no student linked to the given userId', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      // when
      const result = await studentRepository.getByUserId({ userId });

      // then
      expect(result).to.equal(null);
    });
  });
});
