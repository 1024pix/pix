const os = require('os');
const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const moduleUnderTest = require('../../../../lib/application/system');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const { system } = require('../../../../lib/config');

describe('Integration | Application | System | system-controller', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    sinon.stub(heapProfile, 'write').resolves(`${__dirname}/dummy-heap.txt`);
    sinon.stub(heapdump, 'writeSnapshot').yields(null, `${__dirname}/dummy-heap.txt`);
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

      it('should redirect to same path if host does not match', async () => {
        // when
        const response = await httpTestServer.request('GET', '/api/system/heap-dump/not-my-hostname');

        // then
        expect(response.statusCode).to.equal(302);
        expect(response.headers.location).to.equal('/api/system/heap-dump/not-my-hostname');
      });

      it('should resolve a 200 HTTP response', async () => {
        // when
        const response = await httpTestServer.request('GET', `/api/system/heap-dump/${os.hostname()}`);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal('dummy-heap\n');
        expect(response.headers['content-disposition']).to.equal('attachment; filename=dummy-heap.txt');
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
          const promise = httpTestServer.request('GET', `/api/system/heap-dump/${os.hostname()}`);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });
      });
    });
  });

  describe('#generateAndDownloadHeapProfile', () => {

    context('when user is PixMaster', () => {
      beforeEach(() => {
        securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      context('when sampling heap profiler is disabled', () => {
        beforeEach(() => {
          sinon.stub(system, 'samplingHeapProfilerEnabled').value(false);
        });

        it('should return a 404 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('GET', `/api/system/heap-profile/${os.hostname()}`);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result).to.equal('Heap profile sampling is not enabled');
        });
      });

      context('when sampling heap profiler is enabled', () => {
        beforeEach(() => {
          sinon.stub(system, 'samplingHeapProfilerEnabled').value(true);
        });

        it('should redirect to same path if host does not match', async () => {
          // when
          const response = await httpTestServer.request('GET', '/api/system/heap-profile/not-my-hostname');

          // then
          expect(response.statusCode).to.equal(302);
          expect(response.headers.location).to.equal('/api/system/heap-profile/not-my-hostname');
        });

        it('should resolve a 200 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('GET', `/api/system/heap-profile/${os.hostname()}`);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.equal('dummy-heap\n');
          expect(response.headers['content-disposition']).to.equal('attachment; filename=dummy-heap.txt');
        });
      });
    });

    context('when user is not PixMaster', () => {

      beforeEach(() => {
        securityController.checkUserHasRolePixMaster.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should resolve a 403 HTTP response', () => {
        // when
        const promise = httpTestServer.request('GET', `/api/system/heap-profile/${os.hostname()}`);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
