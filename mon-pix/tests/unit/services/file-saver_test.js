import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Service | file-saver', function() {
  setupTest();
  let fileSaver;

  beforeEach(function() {
    fileSaver = this.owner.lookup('service:file-saver');
  });

  describe('#save', function() {
    const id = 123456;
    const url = `/attestation/${id}`;
    const token = 'mytoken';
    const defaultFileName = 'mon-super-fichier.plouf';
    const responseFileName = 'fichier.plouf';
    const responseContent = new Blob();

    let fetchStub;
    let blobStub;
    let downloadFileForIEBrowserStub;
    let downloadFileForModernBrowsersStub;

    beforeEach(function() {
      fileSaver = this.owner.lookup('service:file-saver');
      blobStub = sinon.stub().resolves(responseContent);
      downloadFileForIEBrowserStub = sinon.stub().returns();
      downloadFileForModernBrowsersStub = sinon.stub().returns();
    });

    describe('when response does have a fileName info in headers', function() {
      it('should give fileName from response', async function() {
        // given
        const headers = { get: sinon.stub().withArgs('Content-Disposition').returns(`attachment; filename=${responseFileName}`) };
        const response = { headers, blob: blobStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        await fileSaver.save({
          url,
          fileName: defaultFileName,
          token,
          fetcher: fetchStub,
          downloadFileForIEBrowser: downloadFileForIEBrowserStub,
          downloadFileForModernBrowsers: downloadFileForModernBrowsersStub,
        });

        // then
        const expectedArgs = { fileContent: responseContent, fileName: responseFileName };
        sinon.assert.calledWith(downloadFileForModernBrowsersStub, expectedArgs);
      });
    });

    describe('when response does not have a fileName info in headers', function() {
      it('should give default fileName', async function() {
        // given
        const response = { blob: blobStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        await fileSaver.save({
          url,
          fileName: defaultFileName,
          token,
          fetcher: fetchStub,
          downloadFileForIEBrowser: downloadFileForIEBrowserStub,
          downloadFileForModernBrowsers: downloadFileForModernBrowsersStub,
        });

        // then
        const expectedArgs = { fileContent: responseContent, fileName: defaultFileName };
        sinon.assert.calledWith(downloadFileForModernBrowsersStub, expectedArgs);
      });
    });
  });
});
