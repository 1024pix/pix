import { scoOrganizationLearnerController } from '../../../../../src/prescription/organization-learner/application/sco-organization-learner-controller.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | sco-organization-learner', function () {
  describe('#createUserAndReconcileToOrganizationLearnerFromExternalUser', function () {
    const userId = 2;
    let request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createUserAndReconcileToOrganizationLearnerFromExternalUser');
      usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser.resolves();
    });

    it('should return 200 response with an access token', async function () {
      // given
      hFake.request = { path: {} };
      request = {
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
        payload: {
          data: {
            attributes: {
              birthdate: '01-01-2000',
              'campaign-code': 'BADGES123',
              'external-user-token': '123SamlId',
            },
          },
        },
      };
      const token = Symbol('token');

      usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser.resolves(token);

      // when
      const response =
        await scoOrganizationLearnerController.createUserAndReconcileToOrganizationLearnerFromExternalUser(
          request,
          hFake,
        );

      // then
      expect(response.source.data.attributes['access-token']).to.deep.equal(token);
      expect(response.statusCode).to.equal(200);
    });
  });
});
