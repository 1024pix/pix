const util = require('util');
const heapdump = require('heapdump');
const heapProfile = require('heap-profile');
const systemController = require('../../../../lib/application/system/system-controller');

const { expect, sinon } = require('../../../test-helper');

describe('Unit | Application | System | system-controller', () => {

  describe('#generateAndDownloadHeapDump', () => {

    let hStub;

    beforeEach(() => {
      const writeHeapDumpStub = () => 'heapdump-sec.usec.heapsnapshot';
      sinon.stub(util, 'promisify').withArgs(heapdump.writeSnapshot).returns(writeHeapDumpStub);

      hStub = { file: sinon.stub().resolves() };
    });

    afterEach(() => {
      util.promisify.restore();
    });

    it('should be asynchronous', () => {
      // when
      const promise = systemController.generateAndDownloadHeapDump(null, hStub);

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should take a heap dump snapshot', async () => {
      // when
      await systemController.generateAndDownloadHeapDump(null, hStub);

      // then
      return expect(util.promisify).to.have.been.calledWithExactly(heapdump.writeSnapshot);
    });

    it('should return a file', async () => {
      // when
      await systemController.generateAndDownloadHeapDump(null, hStub);

      // then
      return expect(hStub.file).to.have.been.calledWithMatch('heapdump-sec.usec.heapsnapshot', { mode: 'attachment' });
    });

  });

  describe('#generateAndDownloadHeapProfile', () => {

    let hStub;

    beforeEach(() => {
      const writeHeapProfileStub = () => 'heap-profile.usec.heapprofile';
      sinon.stub(util, 'promisify').withArgs(heapProfile.write).returns(writeHeapProfileStub);

      hStub = { file: sinon.stub().resolves() };
    });

    afterEach(() => {
      util.promisify.restore();
    });

    it('should be asynchronous', () => {
      // when
      const promise = systemController.generateAndDownloadHeapProfile(null, hStub);

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should take a heap dump snapshot', async () => {
      // when
      await systemController.generateAndDownloadHeapProfile(null, hStub);

      // then
      return expect(util.promisify).to.have.been.calledWithExactly(heapProfile.write);
    });

    it('should return a file', async () => {
      // when
      await systemController.generateAndDownloadHeapProfile(null, hStub);

      // then
      return expect(hStub.file).to.have.been.calledWithMatch('heap-profile.usec.heapprofile', { mode: 'attachment' });
    });

  });
});
