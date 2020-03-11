const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const _ = require('lodash');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const Student = require('../../../../lib/domain/models/Student');
const StudentWithUserInfo = require('../../../../lib/domain/models/StudentWithUserInfo');

const { NotFoundError, SameNationalStudentIdInOrganizationError } = require('../../../../lib/domain/errors');

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

  describe('#addOrUpdateOrganizationStudents', () => {

    context('when there are only students to create', () => {

      let students;
      let organizationId;
      let student_1, student_2;

      beforeEach(async () => {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        student_1 = new Student({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });

        student_2 = new Student({
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: 'INE2',
          organizationId,
        });

        students = [student_1, student_2];
      });

      afterEach(() => {
        return knex('students').delete();
      });

      it('should create all students', async function() {
        // when
        await studentRepository.addOrUpdateOrganizationStudents(students, organizationId);

        // then
        const actualStudents = await knex('students').where({ organizationId });
        expect(actualStudents).to.have.lengthOf(2);
        expect(_.map(actualStudents, 'firstName')).to.have.members([student_1.firstName, student_2.firstName]);
      });
    });

    context('when there are only students to update', () => {
      let student_1;
      let student_2;
      let organizationId;

      beforeEach(async () => {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        student_1 = {
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        };
        student_2 = {
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: 'INE2',
          organizationId,
        };
        _.each([student_1, student_2], (student) => databaseBuilder.factory.buildStudent(student));

        await databaseBuilder.commit();
      });

      context('when a student is already imported', async function() {

        let student_1_updated, student_2_updated;
        let students;

        beforeEach(() => {
          // given
          student_1_updated = new Student({
            firstName: 'Lili',
            lastName: student_1.lastName,
            birthdate: student_1.birthdate,
            nationalStudentId: student_1.nationalStudentId,
            organizationId,
          });
          student_2_updated = new Student({
            firstName: 'Mimi',
            lastName: student_2.lastName,
            birthdate: student_2.birthdate,
            nationalStudentId: student_2.nationalStudentId,
            organizationId,
          });

          students = [student_1_updated, student_2_updated];
        });

        it('should update students attributes', async () => {
          // when
          await studentRepository.addOrUpdateOrganizationStudents(students, organizationId);

          // then
          const updated_organization_students = await knex('students').where({ organizationId });

          expect(updated_organization_students).to.have.lengthOf(2);
          expect(_.find(updated_organization_students, { 'nationalStudentId': student_1.nationalStudentId }).firstName).to.equal('Lili');
          expect(_.find(updated_organization_students, { 'nationalStudentId': student_2.nationalStudentId }).firstName).to.equal('Mimi');
        });
      });

      context('when a student is already imported in several organizations', async () => {

        let student_1_updated;
        let student_2_updated;
        let student_1_bis;
        let otherOrganizationId;
        let students;

        beforeEach(async () => {
          otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
          student_1_bis = databaseBuilder.factory.buildStudent({
            firstName: 'Lucie',
            lastName: 'Handmad',
            birthdate: '1990-12-31',
            nationalStudentId: student_1.nationalStudentId,
            organizationId: otherOrganizationId,
          });

          await databaseBuilder.commit();

          student_1_updated = new Student({
            firstName: 'Lili',
            lastName: student_1.lastName,
            birthdate: student_1.birthdate,
            nationalStudentId: student_1.nationalStudentId,
            organizationId,
          });
          student_2_updated = new Student({
            firstName: 'Mimi',
            lastName: student_2.lastName,
            birthdate: student_2.birthdate,
            nationalStudentId: student_2.nationalStudentId,
            organizationId,
          });

          students = [student_1_updated, student_2_updated];
        });

        it('should update the student only in the organization that imports the file', async () => {
          // when
          await studentRepository.addOrUpdateOrganizationStudents(students, organizationId);

          // then
          const updated_organization_students = await knex('students').where({ organizationId });

          expect(updated_organization_students).to.have.lengthOf(2);
          expect(_.find(updated_organization_students, { 'nationalStudentId': student_1.nationalStudentId }).firstName).to.equal(student_1_updated.firstName);
          expect(_.find(updated_organization_students, { 'nationalStudentId': student_2.nationalStudentId }).firstName).to.equal(student_2_updated.firstName);

          const not_updated_organization_students = await knex('students').where({ organizationId: otherOrganizationId });

          expect(not_updated_organization_students).to.have.lengthOf(1);
          expect(not_updated_organization_students[0].firstName).to.equal(student_1_bis.firstName);
        });
      });

    });

    context('when there are students to create and students to update', () => {

      let students;
      let organizationId;
      let studentToCreate, studentUpdated;

      beforeEach(async () => {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildStudent({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });
        await databaseBuilder.commit();

        studentUpdated = new Student({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });

        studentToCreate = new Student({
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: 'INE2',
          organizationId,
        });

        students = [studentUpdated, studentToCreate];
      });

      afterEach(() => {
        return knex('students').delete();
      });

      it('should update and create all students', async function() {
        // when
        await studentRepository.addOrUpdateOrganizationStudents(students, organizationId);

        // then
        const actualStudents = await knex('students').where({ organizationId });
        expect(actualStudents).to.have.lengthOf(2);
        expect(_.map(actualStudents, 'firstName')).to.have.members([studentUpdated.firstName, studentToCreate.firstName]);
      });
    });

    context('when the same nationalStudentId is twice in students to create', () => {

      let students;
      let organizationId;
      let student_1, student_2;
      const sameNationalStudentId = 'SAMEID123';

      beforeEach(async () => {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        student_1 = new Student({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: sameNationalStudentId,
          organizationId,
        });

        student_2 = new Student({
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: sameNationalStudentId,
          organizationId,
        });

        students = [student_1, student_2];
      });

      afterEach(() => {
        return knex('students').delete();
      });

      it('should return a SameNationalStudentIdInOrganizationError', async () => {
        // when
        const error = await catchErr(studentRepository.addOrUpdateOrganizationStudents, studentRepository)(students, organizationId);

        // then
        expect(error).to.be.instanceof(SameNationalStudentIdInOrganizationError);
        expect(error.message).to.equal('L’INE SAMEID123 est déjà présent pour cette organisation.');
      });
    });
  });

  describe('#findByOrganizationIdAndUserBirthdate', () => {

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
      const result = await studentRepository.findByOrganizationIdAndUserBirthdate({
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
      const result = await studentRepository.findByOrganizationIdAndUserBirthdate({
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
      const result = await studentRepository.findByOrganizationIdAndUserBirthdate({
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

  describe('#findOneByUserIdAndOrganizationId', () => {

    let userId;
    let organizationId;

    beforeEach(() => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildStudent({ organizationId, userId });
      return databaseBuilder.commit();
    });

    it('should return instance of Student linked to the given userId and organizationId', async () => {
      // when
      const student = await studentRepository.findOneByUserIdAndOrganizationId({ userId, organizationId });

      // then
      expect(student).to.be.an.instanceOf(Student);
      expect(student.userId).to.equal(userId);
    });

    it('should return null if there is no student linked to the given userId', async () => {
      // given
      const otherUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await studentRepository.findOneByUserIdAndOrganizationId({ userId: otherUserId, organizationId });

      // then
      expect(result).to.equal(null);
    });

    it('should return null if there is no student linked to the given organizationId', async () => {
      // given
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const result = await studentRepository.findOneByUserIdAndOrganizationId({ userId, organizationId: otherOrganizationId });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#get', () => {

    let studentId;

    beforeEach(() => {
      studentId = databaseBuilder.factory.buildStudent().id;
      return databaseBuilder.commit();
    });

    it('should return an instance of Student', async () => {
      // when
      const student = await studentRepository.get(studentId);

      // then
      expect(student).to.be.an.instanceOf(Student);
      expect(student.id).to.equal(studentId);
    });

    it('should return a NotFoundError if no student is found', async () => {
      // given
      const nonExistentStudentId = 678;

      // when
      const result = await catchErr(studentRepository.get)(nonExistentStudentId);

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findStudentsWithUserInfoByOrganizationId', () => {

    it('should return instances of StudentWithUserInfo', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildStudent({
        organizationId: organization.id,
        userId: null,
      });
      await databaseBuilder.commit();

      // when
      const studentsWithUserInfo = await studentRepository.findStudentsWithUserInfoByOrganizationId({ organizationId: organization.id });

      // then
      const studentWithUserInfo = studentsWithUserInfo[0];
      expect(studentWithUserInfo).to.be.an.instanceOf(StudentWithUserInfo);
    });

    it('should return all the StudentWithUserInfo for a given organization ID', async () => {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const student_1 = databaseBuilder.factory.buildStudent({ organizationId: organization_1.id });
      const student_2 = databaseBuilder.factory.buildStudent({ organizationId: organization_1.id, userId: user.id });
      databaseBuilder.factory.buildStudent({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findStudentsWithUserInfoByOrganizationId({ organizationId: organization_1.id });

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

    describe('When student is reconcilied and authenticated by email (and/or) username' , () => {

      it('should return email,username', async () => {

        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser({
          organizationId: organization.id,
        });
        const student = databaseBuilder.factory.buildStudent({
          organizationId: organization.id,
          userId: user.id,
        });
        const expectedStudentWithUserInfo = new StudentWithUserInfo({
          id : student.id,
          firstName : student.firstName,
          lastName : student.lastName,
          birthdate : student.birthdate,
          userId : student.userId,
          organizationId : student.organizationId,
          username : user.username,
          email : user.email,
          isAuthenticatedFromGAR : false,
        });
        await databaseBuilder.commit();

        // when
        const studentsWithUserInfo = await studentRepository.findStudentsWithUserInfoByOrganizationId({ organizationId: organization.id });
        const studentWithUserInfo = studentsWithUserInfo[0];

        // then
        expect(studentWithUserInfo).to.deep.equal(expectedStudentWithUserInfo);

      });

    });

    describe('When student is reconcilied  and  authenticated from GAR' , () => {

      it('should return isAuthenticatedFromGAR with true', async () => {

        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser({
          organizationId: organization.id,
          samlId: 'samlId',
          username: null,
          email: null,
        });
        const student = databaseBuilder.factory.buildStudent({
          organizationId: organization.id,
          userId: user.id,
        });
        const expectedStudentWithUserInfo = new StudentWithUserInfo({
          id : student.id,
          firstName : student.firstName,
          lastName : student.lastName,
          birthdate : student.birthdate,
          userId : student.userId,
          organizationId : student.organizationId,
          username : null,
          email : null,
          isAuthenticatedFromGAR : true,
        });
        await databaseBuilder.commit();

        // when
        const studentsWithUserInfo = await studentRepository.findStudentsWithUserInfoByOrganizationId({ organizationId: organization.id });
        const studentWithUserInfo = studentsWithUserInfo[0];

        // then
        expect(studentWithUserInfo).to.deep.equal(expectedStudentWithUserInfo);

      });

    });

    describe('When student is not reconcilied' , () => {

      it('should not fill email, username  , userId', async () => {

        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const student = databaseBuilder.factory.buildStudent({
          organizationId: organization.id,
          userId: null,
        });

        const expectedStudentWithUserInfo = new StudentWithUserInfo({
          id : student.id,
          firstName : student.firstName,
          lastName : student.lastName,
          birthdate : student.birthdate,
          userId : student.userId,
          organizationId : student.organizationId,
          username : null,
          email : null,
          isAuthenticatedFromGAR : false,
        });
        await databaseBuilder.commit();

        // when
        const studentsWithUserInfo = await studentRepository.findStudentsWithUserInfoByOrganizationId({ organizationId: organization.id });
        const studentWithUserInfo = studentsWithUserInfo[0];

        // then
        expect(studentWithUserInfo).to.deep.equal(expectedStudentWithUserInfo);

      });

    });

  });

});
