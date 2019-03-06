const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const { MembershipCreationError } = require('../../../../lib/domain/errors');
const moduleUnderTest = require('../../../../lib/application/memberships');

describe('Integration | Application | Memberships | membership-controller', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'createMembership');
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('#create', () => {

    const payload = {
      data: {
        type: 'memberships',
        relationships: {
          'user': { data: { type: 'users', id: 1 } },
          'organization': { data: { type: 'organizations', id: 1  } },
        }
      }
    };

    context('Success cases', () => {

      beforeEach(() => {
        const membership = domainBuilder.buildMembership();
        usecases.createMembership.resolves(membership);

        securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      it('should resolve a 201 HTTP response', async () => {
        // when
        const response = await httpTestServer.request('POST', '/api/memberships', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return a JSON API membership', async () => {
        // when
        const response = await httpTestServer.request('POST', '/api/memberships', payload);

        // then
        expect(response.result.data.type).to.equal('memberships');
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          securityController.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', () => {
          // when
          const promise = httpTestServer.request('POST', '/api/memberships', payload);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });
      });

      context('when user is allowed to access resource', () => {

        beforeEach(() => {
          securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
        });

        it('should resolve a JSONAPI 400 HTTP response when membership already exists', () => {
          // given
          const error = new MembershipCreationError();
          usecases.createMembership.rejects(error);

          // when
          const promise = httpTestServer.request('POST', '/api/memberships', payload);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(400);
            expect(response.result.errors[0].code).to.equal('400');
          });
        });

        it('should resolve a JSONAPI 400 HTTP response when the organization or user is not found', () => {
          // given
          usecases.createMembership.rejects(new MembershipCreationError());

          // when
          const promise = httpTestServer.request('POST', '/api/memberships', payload);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(400);
            expect(response.result.errors[0].code).to.equal('400');
          });
        });

        it('should resolve a JSONAPI 500 HTTP response when an unexpected exception occurred', () => {
          // given
          usecases.createMembership.rejects(new Error());

          // when
          const promise = httpTestServer.request('POST', '/api/memberships', payload);

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
