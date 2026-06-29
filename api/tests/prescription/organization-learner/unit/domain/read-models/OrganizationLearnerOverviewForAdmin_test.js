import { OrganizationLearnerOverviewForAdmin } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearnerOverviewForAdmin.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Read-models | OrganizationLearnerOverviewForAdmin', function () {
  describe('#constructor', function () {
    let validArguments;

    beforeEach(function () {
      validArguments = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2000-10-15',
        division: '3A',
        group: 'L1',
        nationalStudentId: '123456ABCDE',
        organizationId: 1,
        organizationName: 'School',
        userId: 1,
        updatedAt: new Date('2020-09-08'),
        isDisabled: false,
      };
    });
    it('should build a valid learner', function () {
      const learner = new OrganizationLearnerOverviewForAdmin(validArguments);
      expect(learner).to.be.an.instanceof(OrganizationLearnerOverviewForAdmin);
      expect(learner).to.be.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2000-10-15',
        division: '3A',
        group: 'L1',
        nationalStudentId: '123456ABCDE',
        organizationId: 1,
        organizationName: 'School',
        userId: 1,
        updatedAt: new Date('2020-09-08'),
        isDisabled: false,
      });
    });
  });
});
