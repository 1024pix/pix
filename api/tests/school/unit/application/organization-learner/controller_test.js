import { expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/school/shared/usecases/index.js';
import { organizationLearnerController } from '../../../../../src/school/application/organization-learner/controller.js';
import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';

describe('Unit | Controller | organization-learner-controller', function () {
  describe('#getById', function () {
    it('should return the serialized organization-learner with completed mission ids', async function () {
      sinon.stub(usecases, 'getOrganizationLearnerWithCompletedMissionIds');
      usecases.getOrganizationLearnerWithCompletedMissionIds.resolves(
        new OrganizationLearner({
          id: '4356',
          completedMissionIds: ['rec12344', 'rec435'],
          firstName: 'Edward',
          lastName: 'Cullen',
          division: 'CM2',
          organizationId: '345',
        }),
      );
      const id = 4567;
      const request = {
        params: { id },
      };

      const response = await organizationLearnerController.getById(request, hFake);

      const expectedOrganizationLearner = {
        data: {
          attributes: {
            'completed-mission-ids': ['rec12344', 'rec435'],
            'first-name': 'Edward',
            'last-name': 'Cullen',
            division: 'CM2',
            'organization-id': '345',
          },
          id: '4356',
          type: 'organizationLearners',
        },
      };

      expect(usecases.getOrganizationLearnerWithCompletedMissionIds).to.have.been.calledWith({
        organizationLearnerId: id,
      });
      expect(response).to.deep.equal(expectedOrganizationLearner);
    });
  });
});
