import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | file-saver', function (hooks) {
  setupTest(hooks);
  let fileSaver;

  hooks.beforeEach(function () {
    fileSaver = this.owner.lookup('service:file-saver');
  });

  module('#save', function (hooks) {
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

    hooks.beforeEach(function () {
      fileSaver = this.owner.lookup('service:file-saver');
      blobStub = sinon.stub().resolves(responseContent);
      jsonStub = sinon.stub();
      downloadFileForIEBrowserStub = sinon.stub().returns();
      downloadFileForModernBrowsersStub = sinon.stub().returns();
    });

    module('when response does have a fileName info in headers', function () {
      test('should give fileName from response', async function (assert) {
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
        assert.ok(true);
      });
    });

    module('when response does not have a fileName info in headers', function () {
      test('should give default fileName', async function (assert) {
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
        assert.ok(true);
      });
    });

    module('when the response is an error', function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/require-expect
      test('should throw an error with the response error detail as message', async function (assert) {
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
          assert.strictEqual(error.message, 'the error message');
        }
      });
    });
  });
});
