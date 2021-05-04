const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');
const scoOrganizationInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/sco-organization-invitation-serializer');
const moduleUnderTest = require('../../../../lib/application/organization-invitations');

const {
  AlreadyExistingOrganizationInvitationError, NotFoundError, UserNotFoundError, OrganizationWithoutEmailError, OrganizationNotFoundError, ManyOrganizationsFoundError,
} = require('../../../../lib/domain/errors');

describe('Integration | Application | Organization-invitations | organization-invitation-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(async() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'acceptOrganizationInvitation');
    sandbox.stub(usecases, 'sendScoInvitation');
    sandbox.stub(scoOrganizationInvitationSerializer, 'serialize');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#acceptOrganizationInvitation', () => {

    const payload = {
      data: {
        id: '100047_DZWMP7L5UM',
        type: 'organization-invitation-responses',
        attributes: {
          code: 'DZWMP7L5UM',
          email: 'user@example.net',
        },
      },
    };

    context('Success cases', () => {

      it('should return an HTTP response with status code 204', async () => {
        // given
        usecases.acceptOrganizationInvitation.resolves();

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', () => {

      it('should respond an HTTP response with status code 412 when AlreadyExistingOrganizationInvitationError', async () => {
        // given
        usecases.acceptOrganizationInvitation.rejects(new AlreadyExistingOrganizationInvitationError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(412);
      });

      it('should respond an HTTP response with status code 404 when NotFoundError', async () => {
        // given
        usecases.acceptOrganizationInvitation.rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async () => {
        // given
        usecases.acceptOrganizationInvitation.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('#sendScoInvitation', () => {

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

    context('Success cases', () => {

      it('should return an HTTP response with status code 201', async () => {
        // given
        usecases.sendScoInvitation.resolves();

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', () => {

      it('should respond an HTTP response with status code 404 when OrganizationNotFoundError', async () => {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationNotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 409 when OrganizationWithoutEmailError', async () => {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationWithoutEmailError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(412);
      });

      it('should respond an HTTP response with status code 409 when ManyOrganizationsFoundError', async () => {
        // given
        usecases.sendScoInvitation.rejects(new ManyOrganizationsFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(409);
      });
    });
  });

});
