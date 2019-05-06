const util = require('util');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const systemController = require('../../../../lib/application/system/system-controller');

const { expect, sinon, hFake } = require('../../../test-helper');

describe('Unit | Application | System | system-controller', () => {

  describe('#generateAndDownloadHeapDump', () => {

    beforeEach(() => {
      sinon.stub(heapdump, 'writeSnapshot').yields(null, 'heapdump-sec.usec.heapsnapshot');
    });

    it('should take a heap dump snapshot and return a file', async () => {
      // when
      const response = await systemController.generateAndDownloadHeapDump(null, hFake);

      // then
      expect(response.source.path).to.equal('heapdump-sec.usec.heapsnapshot');
      expect(response.source.options).to.deep.equal({ mode: 'attachment' });
    });
  });

  describe('#generateAndDownloadHeapProfile', () => {

    beforeEach(() => {
      sinon.stub(heapProfile, 'write').yields(null, 'heap-profile.usec.heapprofile');
    });

    it('should take a heap dump snapshot and return a file', async () => {
      // when
      const response = await systemController.generateAndDownloadHeapProfile(null, hFake);

      // then
      expect(response.source.path).to.equal('heap-profile.usec.heapprofile');
      expect(response.source.options).to.deep.equal({ mode: 'attachment' });
    });
  });
});
