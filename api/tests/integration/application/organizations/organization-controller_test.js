const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const { NotFoundError } = require('../../../../lib/domain/errors');
const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | organization-controller', () => {

  const organization = domainBuilder.buildOrganization();

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'updateOrganizationInformation');
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('#updateOrganizationInformation', () => {

    const payload = {
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
    };

    context('Success cases', () => {

      beforeEach(() => {
        securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      it('should resolve a 200 HTTP response', () => {
        // given
        usecases.updateOrganizationInformation.resolves(organization);

        // when
        const promise = httpTestServer.request('PATCH', '/api/organizations/1234', payload);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return a JSON API organization', () => {
        // given
        usecases.updateOrganizationInformation.resolves(organization);

        // when
        const promise = httpTestServer.request('PATCH', '/api/organizations/1234', payload);

        // then
        return promise.then((response) => {
          expect(response.result.data.type).to.equal('organizations');
        });
      });
    });

    context('Error cases', () => {

      context('when user is allowed to access resource', () => {

        beforeEach(() => {
          securityController.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', () => {
          // when
          const promise = httpTestServer.request('PATCH', '/api/organizations/1234', payload);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });

        context('when user is allowed to access resource', () => {

          beforeEach(() => {
            securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
          });

          it('should resolve a 404 HTTP response when organization does not exist', () => {
            // given
            const error = new NotFoundError('Organization not found');
            usecases.updateOrganizationInformation.rejects(error);

            // when
            const promise = httpTestServer.request('PATCH', '/api/organizations/1234', payload);

            // then
            return promise.then((response) => {
              expect(response.statusCode).to.equal(404);
            });
          });

          it('should resolve a 500 HTTP response when an unexpected exception occurred', () => {
            // given
            usecases.updateOrganizationInformation.rejects(new Error());

            // when
            const promise = httpTestServer.request('PATCH', '/api/organizations/1234', payload);

            // then
            return promise.then((response) => {
              expect(response.statusCode).to.equal(500);
              expect(response.result.errors[0].code).to.equal('500');
            });
          });
        });
      });
    });
  });
});
