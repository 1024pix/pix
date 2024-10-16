import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import { repositories } from '../../../../../src/school/infrastructure/repositories/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Repository | organizationLearner', function () {
  describe('#getStudentsByOrganizationId', function () {
    it('should return student corresponding to the organizationId', async function () {
      const organizationId = 234567;
      const rawStudent = { id: 1234, firstName: 'Léon', lastName: 'De Bruxelles', division: '4ème', organizationId };
      const expectedStudent = new OrganizationLearner(rawStudent);
      const organizationLearnerApiStub = { find: sinon.stub() };

      organizationLearnerApiStub.find.withArgs({ organizationId }).resolves({ organizationLearners: [rawStudent] });

      const students = await repositories.organizationLearnerRepository.getStudentsByOrganizationId({
        organizationId,
        organizationLearnerApi: organizationLearnerApiStub,
      });

      expect(students).to.deep.equal([expectedStudent]);
    });
  });

  describe('#getById', function () {
    it('should return the student corresponding to the id', async function () {
      const rawStudent = {
        id: 1234,
        firstName: 'Léon',
        lastName: 'De Bruxelles',
        division: '4ème',
        organizationId: 23456,
      };
      const expectedStudent = new OrganizationLearner(rawStudent);
      const organizationLearnerApiStub = { get: sinon.stub() };

      organizationLearnerApiStub.get.withArgs(rawStudent.id).resolves(rawStudent);

      const student = await repositories.organizationLearnerRepository.getById({
        organizationLearnerId: rawStudent.id,
        organizationLearnerApi: organizationLearnerApiStub,
      });

      expect(student).to.deep.equal(expectedStudent);
    });
  });
});
