const { expect, databaseBuilder } = require('../../../test-helper');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');

describe('Integration | Infrastructure | Repository | student-repository', function () {
  describe('#findReconciledStudentsByNationalStudentId', function () {
    it('should return instances of Student', async function () {
      // given
      const firstNationalStudentId = '123456789AB';
      const firstAccount = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: firstAccount.id });
      databaseBuilder.factory.buildCertificationCourse({ userId: firstAccount.id });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: firstAccount.id,
        nationalStudentId: firstNationalStudentId,
      });

      const secondAccount = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: secondAccount.id });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: secondAccount.id,
        nationalStudentId: firstNationalStudentId,
      });

      const secondNationalStudentId = '567891234CD';
      const thirdAccount = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildOrganizationLearner({
        userId: thirdAccount.id,
        nationalStudentId: secondNationalStudentId,
      });

      await databaseBuilder.commit();

      // when
      const students = await studentRepository.findReconciledStudentsByNationalStudentId([
        firstNationalStudentId,
        secondNationalStudentId,
      ]);

      // then
      expect(students.length).to.equal(2);
      expect(students[0].nationalStudentId).to.equal(firstNationalStudentId);
      expect(students[0].account).to.deep.equal({
        userId: firstAccount.id,
        updatedAt: firstAccount.updatedAt,
        certificationCount: 2,
      });
      expect(students[1].nationalStudentId).to.equal(secondNationalStudentId);
      expect(students[1].account).to.deep.equal({
        userId: thirdAccount.id,
        updatedAt: thirdAccount.updatedAt,
        certificationCount: 0,
      });
    });
  });

  describe('#getReconciledStudentByNationalStudentId', function () {
    it('should return instance of Student', async function () {
      // given
      const nationalStudentId = '123456789AB';
      const account = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCourse({ userId: account.id });
      databaseBuilder.factory.buildCertificationCourse({ userId: account.id });
      databaseBuilder.factory.buildOrganizationLearner({ userId: account.id, nationalStudentId: nationalStudentId });

      await databaseBuilder.commit();

      // when
      const student = await studentRepository.getReconciledStudentByNationalStudentId(nationalStudentId);

      // then
      expect(student.nationalStudentId).to.equal(nationalStudentId);
      expect(student.account).to.deep.equal({
        userId: account.id,
        updatedAt: account.updatedAt,
        certificationCount: 2,
      });
    });

    it('should return null when no student found', async function () {
      // given
      const nationalStudentId = '000000999B';

      // when
      const student = await studentRepository.getReconciledStudentByNationalStudentId(nationalStudentId);

      // then
      expect(student).to.be.null;
    });
  });
});
