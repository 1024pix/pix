const { expect, databaseBuilder } = require('../../../test-helper');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');

describe('Integration | Infrastructure | Repository | student-repository', () => {

  describe('#findReconciledStudentsByNationalStudentId', () => {

    it('should return instances of Student', async () => {
      // given
      const firstNationalStudentId = '123456789AB';
      const firstAccount = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: firstAccount.id });
      databaseBuilder.factory.buildCertificationCourse({ userId: firstAccount.id });
      databaseBuilder.factory.buildSchoolingRegistration({ userId: firstAccount.id, nationalStudentId: firstNationalStudentId });

      const secondAccount = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: secondAccount.id });
      databaseBuilder.factory.buildSchoolingRegistration({ userId: secondAccount.id, nationalStudentId: firstNationalStudentId });

      const secondNationalStudentId = '567891234CD';
      const thirdAccount = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildSchoolingRegistration({ userId: thirdAccount.id, nationalStudentId: secondNationalStudentId });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findReconciledStudentsByNationalStudentId([firstNationalStudentId, secondNationalStudentId]);

      // then
      expect(students.length).to.equal(2);
      expect(students[0].nationalStudentId).to.equal(firstNationalStudentId);
      expect(students[0].account).to.deep.equal({ userId: firstAccount.id, updatedAt: firstAccount.updatedAt, certificationCount: 2 });
      expect(students[1].nationalStudentId).to.equal(secondNationalStudentId);
      expect(students[1].account).to.deep.equal({ userId: thirdAccount.id, updatedAt: thirdAccount.updatedAt, certificationCount: 0 });
    });
  });
});
