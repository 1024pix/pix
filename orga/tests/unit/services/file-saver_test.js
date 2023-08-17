import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
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
    const responseFileName = 'fichier.plouf';
    const responseContent = new Blob();

    let fetchStub;
    let blobStub;
    let downloadFileForIEBrowserStub;
    let downloadFileForModernBrowsersStub;

    hooks.beforeEach(function () {
      fileSaver = this.owner.lookup('service:file-saver');
      blobStub = sinon.stub().resolves(responseContent);
      downloadFileForIEBrowserStub = sinon.stub().returns();
      downloadFileForModernBrowsersStub = sinon.stub().returns();
    });

    module('when response has a status 200', function () {
      test('should use fileName and fileContent from response', async function (assert) {
        // given
        const headers = {
          get: sinon.stub(),
        };
        headers.get.withArgs('Content-Disposition').returns(`attachment; filename=${responseFileName}`);
        const jsonStub = sinon.stub().resolves('a json');

        const response = { headers, blob: blobStub, status: 200, json: jsonStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        await fileSaver.save({
          url,
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

    module('when response has not a status 200', function () {
      test('should throw', async function (assert) {
        // given
        const headers = {
          get: sinon.stub(),
        };
        headers.get.withArgs('Content-Disposition').returns(`attachment; filename=${responseFileName}`);
        const jsonStub = sinon.stub().resolves({ errors: [] });
        const response = { headers, blob: blobStub, status: 403, json: jsonStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        const promise = fileSaver.save({
          url,
          token,
          fetcher: fetchStub,
          downloadFileForIEBrowser: downloadFileForIEBrowserStub,
          downloadFileForModernBrowsers: downloadFileForModernBrowsersStub,
        });

        // then
        assert.rejects(promise);
      });
    });
  });
});
