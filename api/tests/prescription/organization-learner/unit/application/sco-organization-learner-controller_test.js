import { scoOrganizationLearnerController } from '../../../../../src/prescription/organization-learner/application/sco-organization-learner-controller.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Prescription | Unit | Application | Controller | sco-organization-learner', function () {
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
              'organization-id': 123,
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

  describe('#createAndReconcileUserToOrganizationLearner', function () {
    const userId = 2;
    const request = { auth: { credentials: { userId } }, payload: { data: { attributes: {} } } };

    beforeEach(function () {
      sinon.stub(usecases, 'createAndReconcileUserToOrganizationLearner');
      usecases.createAndReconcileUserToOrganizationLearner.resolves();
      request.payload.data.attributes = {
        'first-name': 'Robert',
        'last-name': 'Smith',
        birthdate: '2012-12-12',
        'organization-id': 1,
        password: 'P@ssw0rd',
        username: 'robert.smith1212',
        'with-username': true,
      };
    });

    context('Success cases', function () {
      context('When email is used', function () {
        it('should return an HTTP response with status code 204', async function () {
          // given
          const createdUser = domainBuilder.buildUser();
          request.payload.data.attributes.email = 'toto@example.net';
          delete request.payload.data.attributes.username;
          request.payload.data.attributes['with-username'] = false;
          usecases.createAndReconcileUserToOrganizationLearner.resolves(createdUser);

          // when
          const response = await scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner(
            request,
            hFake,
          );
          // then
          expect(response.statusCode).to.equal(204);
        });
      });

      context('When username is used', function () {
        it('should return an HTTP response with status code 204', async function () {
          // given
          const createdUser = domainBuilder.buildUser();
          delete request.payload.data.attributes.email;
          request.payload.data.attributes.username = 'robert.smith1212';
          request.payload.data.attributes['with-username'] = true;
          usecases.createAndReconcileUserToOrganizationLearner.resolves(createdUser);

          // when
          const response = await scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner(
            request,
            hFake,
          );

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('Error cases', function () {
      context('when a NotFoundError is thrown', function () {
        it('should resolve a 404 HTTP response', async function () {
          // given
          delete request.payload.data.attributes.username;
          usecases.createAndReconcileUserToOrganizationLearner.rejects(new NotFoundError());

          // when
          const error = await catchErr(scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner)(
            request,
            hFake,
          );
          // then
          expect(error).instanceOf(NotFoundError);
        });
      });
    });
  });
});
