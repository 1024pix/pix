const util = require('util');
const heapdump = require('heapdump');
let gcController = require('../../../../lib/application/gc/gc-controller');

const { expect, sinon } = require('../../../test-helper');

describe('Unit | Application | GC | gc-controller', () => {

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
      const promise = gcController.generateAndDownloadHeapDump(null, hStub);

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should take a heap dump snapshot', async () => {
      // when
      await gcController.generateAndDownloadHeapDump(null, hStub);

      // then
      return expect(util.promisify).to.have.been.calledWithExactly(heapdump.writeSnapshot);
    });

    it('should return a file', async () => {
      // when
      await gcController.generateAndDownloadHeapDump(null, hStub);

      // then
      return expect(hStub.file).to.have.been.calledWithMatch('heapdump-sec.usec.heapsnapshot', { mode: 'attachment' })
    });

  });
});
