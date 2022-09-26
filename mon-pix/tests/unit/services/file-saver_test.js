import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Service | file-saver', function () {
  setupTest();
  let fileSaver;

  beforeEach(function () {
    fileSaver = this.owner.lookup('service:file-saver');
  });

  describe('#save', function () {
    const id = 123456;
    const url = `/attestation/${id}`;
    const token = 'mytoken';
    const defaultFileName = 'mon-super-fichier.plouf';
    const responseFileName = 'fichier.plouf';
    const responseContent = new Blob();

    let fetchStub;
    let blobStub;
    let jsonStub;
    let downloadFileForIEBrowserStub;
    let downloadFileForModernBrowsersStub;

    beforeEach(function () {
      fileSaver = this.owner.lookup('service:file-saver');
      blobStub = sinon.stub().resolves(responseContent);
      jsonStub = sinon.stub();
      downloadFileForIEBrowserStub = sinon.stub().returns();
      downloadFileForModernBrowsersStub = sinon.stub().returns();
    });

    describe('when response does have a fileName info in headers', function () {
      it('should give fileName from response', async function () {
        // given
        const headers = {
          get: sinon.stub(),
        };
        headers.get.withArgs('Content-Disposition').returns(`attachment; filename=${responseFileName}`);
        const response = { ok: true, headers, blob: blobStub, json: jsonStub };
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

    describe('when response does not have a fileName info in headers', function () {
      it('should give default fileName', async function () {
        // given
        const response = { ok: true, blob: blobStub, json: jsonStub };
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

    describe('when the response is an error', function () {
      it('should throw an error with the response error detail as message', async function () {
        // given
        jsonStub.resolves({ errors: [{ detail: 'the error message' }] });
        const response = { ok: false, json: jsonStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        try {
          await fileSaver.save({
            url,
            fileName: defaultFileName,
            token,
            fetcher: fetchStub,
            downloadFileForIEBrowser: downloadFileForIEBrowserStub,
            downloadFileForModernBrowsers: downloadFileForModernBrowsersStub,
          });
        } catch (error) {
          expect(error.message).to.equal('the error message');
        }
      });
    });
  });
});
