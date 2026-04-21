import sinon from 'sinon';

import { CopyAttestationsTemplatesPdfScript } from '../../../scripts/prod/copy-attestations-templates-pdf.js';

describe('CopyAttestationsTemplatesPdfScript', function () {
  let fsStub, createReadStreamStub, logger, clientStub;

  const script = new CopyAttestationsTemplatesPdfScript();

  beforeEach(function () {
    fsStub = {
      readdir: sinon.stub().resolves(['1.pdf', '2.pdf', '3.pdf']),
    };
    createReadStreamStub = sinon.stub().resolves();
    logger = { info: sinon.stub(), error: sinon.stub() };

    clientStub = {
      startUpload: sinon.stub(),
    };
    clientStub.startUpload.resolves();
  });
  it('should upload each file contained in templates folder', async function () {
    await script.handle({
      options: { dryRun: false },
      logger,
      dependencies: { fs: fsStub, client: clientStub, createReadStream: createReadStreamStub },
    });

    expect(clientStub.startUpload.callCount).to.equal(3);
  });

  context('when dry run is true', function () {
    it('should not upload file', async function () {
      await script.handle({
        options: { dryRun: true },
        logger,
        dependencies: { fs: fsStub, client: clientStub, createReadStream: createReadStreamStub },
      });

      expect(clientStub.startUpload).not.to.have.been.called;
      expect(logger.info).to.have.been.calledWith('[DRY RUN] 1.pdf would have been copied to S3 bucket');
      expect(logger.info).to.have.been.calledWith('[DRY RUN] 2.pdf would have been copied to S3 bucket');
      expect(logger.info).to.have.been.calledWith('[DRY RUN] 3.pdf would have been copied to S3 bucket');
    });
  });
});
