const { expect, sinon, factory } = require('../../../test-helper');
const Hapi = require('hapi');
const usecases = require('../../../../lib/domain/usecases');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Organizations | organization-controller', () => {

  const organization = factory.buildOrganization();

  let server;

  beforeEach(() => {
    sinon.stub(usecases, 'updateOrganizationInformation');
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));

  });

  afterEach(() => {
    usecases.updateOrganizationInformation.restore();
    securityController.checkUserHasRolePixMaster.restore();
  });

  describe('#updateOrganizationInformation', () => {

    const options = {
      method: 'PATCH',
      url: `/api/organizations/${organization.id}`,
      payload: {
        data: {
          type: 'organizations',
          id: '1',
          attributes: {
            'name': 'The name of the organization',
            'type': 'PRO',
            'code': 'ABCD12',
            'logo-url': 'http://log.url',
          }
        }
      },
    };

    context('Green case', () => {

      it('should resolve a 200 HTTP response', () => {
        // given
        usecases.updateOrganizationInformation.resolves(organization);

        server = new Hapi.Server();
        server.connection({ port: null });
        server.register({ register: require('../../../../lib/application/organizations') });

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

    });

    context('Red cases', () => {

      it('should resolve a 404 HTTP response when organization does not exist', () => {
        // given
        const error = new NotFoundError('Organization not found');
        usecases.updateOrganizationInformation.rejects(error);

        server = new Hapi.Server();
        server.connection({ port: null });
        server.register({ register: require('../../../../lib/application/organizations') });

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });

});
