const { expect, databaseBuilder, knex } = require('../../../test-helper');
const _ = require('lodash');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const Student = require('../../../../lib/domain/models/Student');

describe('Integration | Infrastructure | Repository | student-repository', () => {

  beforeEach(() => {
    return databaseBuilder.clean();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

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
      const student_2 = databaseBuilder.factory.buildStudent({ organizationId: organization.id, lastName: 'Avatar', firstName: 'Xavier' });
      const student_3 = databaseBuilder.factory.buildStudent({ organizationId: organization.id, lastName: 'Avatar', firstName: 'Arthur' });
      const student_4 = databaseBuilder.factory.buildStudent({ organizationId: organization.id, lastName: 'Avatar', firstName: 'MATHURIN' });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      expect(_.map(students, 'id')).to.deep.include.ordered.members([student_3.id, student_4.id, student_2.id, student_1.id]);
    });
  });

  describe('#batchSave', () => {

    afterEach(() => {
      return knex('students').delete();
    });

    it('should save all students', async function() {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const student_1 = { firstName: 'Handmade', lastName: 'Luciole', birthdate: '01/01/1990', organizationId: organization.id };
      const student_2 = { firstName: 'Harry', lastName: 'Covert', birthdate: '01/01/1990', organizationId: organization.id };
      const studentsToSave = [ student_1, student_2 ];

      // when
      const lastStudentId = await studentRepository.batchSave(studentsToSave);

      // then
      const students = await knex('students').where({ organizationId: organization.id });
      expect(students).to.have.lengthOf(2);
      expect(students[0].id).to.not.be.undefined;
      expect(students[0].firstName).to.equal(student_1.firstName);
      expect(students[0].lastName).to.equal(student_1.lastName);
      expect(students[0].birthdate).to.equal(student_1.birthdate);
      expect(students[1].id).to.not.be.undefined;
      expect(students[1].firstName).to.equal(student_2.firstName);
      expect(students[1].lastName).to.equal(student_2.lastName);
      expect(students[1].birthdate).to.equal(student_2.birthdate);
      expect(lastStudentId[0]).to.equal(students[1].id);
    });
  });
});
