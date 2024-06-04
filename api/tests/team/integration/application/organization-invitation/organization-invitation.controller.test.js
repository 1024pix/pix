import {
  ManyOrganizationsFoundError,
  OrganizationArchivedError,
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
} from '../../../../../lib/domain/errors.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { serializer as scoOrganizationInvitationSerializer } from '../../../../../src/team/infrastructure/serializers/jsonapi/sco-organization-invitation.serializer.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

const routesUnderTest = teamRoutes[0];

describe('Integration | Team | Application | Controller | Organization invitations', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'sendScoInvitation');
    sandbox.stub(scoOrganizationInvitationSerializer, 'serialize');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#sendScoInvitation', function () {
    const uai = '1234567A';
    const payload = {
      data: {
        type: 'sco-organization-invitations',
        attributes: {
          uai,
          'first-name': 'john',
          'last-name': 'harry',
        },
      },
    };

    context('Success cases', function () {
      it('should return an HTTP response with status code 201', async function () {
        // given
        usecases.sendScoInvitation.resolves();

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', function () {
      it('should respond an HTTP response with status code 404 when OrganizationNotFoundError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationNotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 412 when OrganizationWithoutEmailError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationWithoutEmailError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(412);
      });

      it('should respond an HTTP response with status code 409 when ManyOrganizationsFoundError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new ManyOrganizationsFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(409);
      });

      it('should respond an HTTP response with status code 422 when OrganizationArchivedError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationArchivedError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
