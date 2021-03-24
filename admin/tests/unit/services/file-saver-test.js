import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | file-saver', (hooks) => {
  setupTest(hooks);
  let fileSaver;

  hooks.beforeEach(function() {
    fileSaver = this.owner.lookup('service:file-saver');
  });

  module('#save', () => {
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

    hooks.beforeEach(function() {
      fileSaver = this.owner.lookup('service:file-saver');
      blobStub = sinon.stub().resolves(responseContent);
      downloadFileForIEBrowserStub = sinon.stub().returns();
      downloadFileForModernBrowsersStub = sinon.stub().returns();
    });

    module('when response does have a fileName info in headers', () => {
      test('should give fileName from response', async function(assert) {
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
        assert.ok(downloadFileForModernBrowsersStub.calledWith(expectedArgs));
      });
    });

    module('when response does not have a fileName info in headers', () => {
      test('should give default fileName', async function(assert) {
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
        assert.ok(downloadFileForModernBrowsersStub.calledWith(expectedArgs));

      });
    });
  });

});
