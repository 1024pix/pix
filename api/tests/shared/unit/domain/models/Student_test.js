import { Student } from '../../../../../src/shared/domain/models/Student.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Models | Student', function () {
  describe('.fromRawResults', function () {
    it('returns one Student per nationalStudentId', function () {
      const results = [
        {
          nationalStudentId: 'INE1',
          userId: 1,
          certificationCount: 0,
          organizationId: 10,
          birthdate: '2000-01-01',
          updatedAt: new Date(),
        },
        {
          nationalStudentId: 'INE2',
          userId: 2,
          certificationCount: 0,
          organizationId: 10,
          birthdate: '2001-05-10',
          updatedAt: new Date(),
        },
      ];

      const students = Student.fromRawResults(results);

      expect(students).to.have.lengthOf(2);
      expect(students[0]).to.be.instanceof(Student);
    });

    it('picks the account with the most certifications when a nationalStudentId has multiple accounts', function () {
      const results = [
        {
          nationalStudentId: 'INE1',
          userId: 1,
          certificationCount: 2,
          organizationId: 10,
          birthdate: '2000-01-01',
          updatedAt: new Date('2020-01-01'),
        },
        {
          nationalStudentId: 'INE1',
          userId: 2,
          certificationCount: 5,
          organizationId: 20,
          birthdate: '2000-01-01',
          updatedAt: new Date('2019-01-01'),
        },
      ];

      const [student] = Student.fromRawResults(results);

      expect(student.account.userId).to.equal(2);
    });

    it('picks the most recently updated account when certificationCount is equal', function () {
      const results = [
        {
          nationalStudentId: 'INE1',
          userId: 1,
          certificationCount: 3,
          organizationId: 10,
          birthdate: '2000-01-01',
          updatedAt: new Date('2019-01-01'),
        },
        {
          nationalStudentId: 'INE1',
          userId: 2,
          certificationCount: 3,
          organizationId: 20,
          birthdate: '2000-01-01',
          updatedAt: new Date('2021-06-15'),
        },
      ];

      const [student] = Student.fromRawResults(results);

      expect(student.account.userId).to.equal(2);
    });

    it('only exposes the expected account fields', function () {
      const results = [
        {
          nationalStudentId: 'INE1',
          userId: 1,
          certificationCount: 0,
          organizationId: 10,
          birthdate: '2000-01-01',
          updatedAt: new Date(),
          extra: 'ignored',
        },
      ];

      const [student] = Student.fromRawResults(results);

      expect(Object.keys(student.account)).to.deep.equal([
        'userId',
        'certificationCount',
        'organizationId',
        'birthdate',
        'updatedAt',
      ]);
    });

    it('returns an empty array for empty input', function () {
      expect(Student.fromRawResults([])).to.deep.equal([]);
    });
  });
});
