const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const gcController = require('../../../../lib/application/gc/gc-controller');
const moduleUnderTest = require('../../../../lib/application/gc');

describe('Integration | Application | GC | gc-controller', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(gcController, 'generateAndDownloadHeapDump').resolves('any Node.js Stream');
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#generateAndDownloadHeapDump', () => {

    context('Success cases', () => {

      beforeEach(() => {
        securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      it('should resolve a 200 HTTP response', async () => {
        // when
        const response = await httpTestServer.request('GET', '/api/gc/heap-dump');

        // then
        expect(response.statusCode).to.equal(200);
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
          const promise = httpTestServer.request('GET', '/api/gc/heap-dump');

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });
      });
    });
  });

});
