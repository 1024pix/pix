const os = require('os');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const systemController = require('../../../../lib/application/system/system-controller');
const { system } = require('../../../../lib/config');

const { expect, sinon, hFake } = require('../../../test-helper');

describe('Unit | Application | System | system-controller', () => {

  describe('#generateAndDownloadHeapDump', () => {

    const request = { params: { hostname: 'web-1' }, url: { path: '/api/system/heap-dump/web-1' } };

    beforeEach(() => {
      sinon.stub(heapdump, 'writeSnapshot').yields(null, 'heapdump-sec.usec.heapsnapshot');
      sinon.stub(os, 'hostname');
    });

    it('should take a heap dump snapshot and return a file when matching host name', async () => {
      // given
      os.hostname.returns('my-app-web-1');

      // when
      const response = await systemController.generateAndDownloadHeapDump(request, hFake);

      // then
      expect(response.source.path).to.equal('heapdump-sec.usec.heapsnapshot');
      expect(response.source.options).to.deep.equal({ mode: 'attachment' });
    });

    it('should redirect to itself when not matching host name', async () => {
      // given
      os.hostname.returns('my-app-web-999');

      // when
      const response = await systemController.generateAndDownloadHeapDump(request, hFake);

      // then
      expect(response.location).to.equal('/api/system/heap-dump/web-1');
    });
  });

  describe('#generateAndDownloadHeapProfile', () => {

    const request = { params: { hostname: 'web-1' }, url: { path: '/api/system/heap-profile/web-1' } };

    context('when heap profile sampling is enabled', () => {

      beforeEach(() => {
        system.samplingHeapProfilerEnabled = true;

        sinon.stub(heapProfile, 'write').yields(null, 'heap-profile.usec.heapprofile');
        sinon.stub(os, 'hostname');
      });

      afterEach(() => {
        system.samplingHeapProfilerEnabled = false;
      });

      it('should take a heap dump snapshot and return a file when matching host name', async () => {
        // given
        os.hostname.returns('my-app-web-1');

        // when
        const response = await systemController.generateAndDownloadHeapProfile(request, hFake);

        // then
        expect(response.source.path).to.equal('heap-profile.usec.heapprofile');
        expect(response.source.options).to.deep.equal({ mode: 'attachment' });
      });

      it('should redirect to itself when not matching host name', async () => {
        // given
        os.hostname.returns('my-app-web-999');

        // when
        const response = await systemController.generateAndDownloadHeapProfile(request, hFake);

        // then
        expect(response.location).to.equal('/api/system/heap-profile/web-1');
      });
    });

    context('when heap profile sampling is disabled', () => {

      beforeEach(() => {
        system.samplingHeapProfilerEnabled = false;
      });

      afterEach(() => {
        system.samplingHeapProfilerEnabled = false;
      });

      it('should return a 404 response when ', async () => {
        // given

        // when
        const response = await systemController.generateAndDownloadHeapProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.source).to.equal('Heap profile sampling is disabled for the server web-1');
      });
    });
  });
});
