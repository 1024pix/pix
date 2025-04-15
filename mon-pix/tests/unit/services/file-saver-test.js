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

    module('when options are given', function (hooks) {
      let fetchAPIStub;
      hooks.beforeEach(function () {
        fetchAPIStub = sinon.stub(window, 'fetch').resolves({
          ok: true,
          headers: {
            get: sinon.stub().returns(`attachment; filename=${responseFileName}`),
          },
          blob: blobStub,
          json: jsonStub,
        });
      });

      hooks.afterEach(function () {
        sinon.restore();
      });

      test('should override the HTTP method', async function (assert) {
        // given
        const expectedMethod = 'PATCH';
        const headers = {
          get: sinon.stub().withArgs('Content-Disposition').returns(`attachment; filename=${responseFileName}`),
        };
        const response = { ok: true, headers, blob: blobStub, json: jsonStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        await fileSaver.save({
          url,
          fileName: defaultFileName,
          token,
          options: {
            method: expectedMethod,
          },
          downloadFileForIEBrowser: downloadFileForIEBrowserStub,
          downloadFileForModernBrowsers: downloadFileForModernBrowsersStub,
        });

        // then
        const fetchOptions = fetchAPIStub.getCall(0).args[1];
        assert.strictEqual(fetchOptions.method, expectedMethod);
      });

      test('should add a JSON body', async function (assert) {
        // given
        const expectedBody = { test: 'body' };
        const headers = {
          get: sinon.stub().withArgs('Content-Disposition').returns(`attachment; filename=${responseFileName}`),
        };
        const response = { ok: true, headers, blob: blobStub, json: jsonStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        await fileSaver.save({
          url,
          fileName: defaultFileName,
          token,
          options: {
            body: expectedBody,
          },
          downloadFileForIEBrowser: downloadFileForIEBrowserStub,
          downloadFileForModernBrowsers: downloadFileForModernBrowsersStub,
        });

        // then
        const fetchOptions = fetchAPIStub.getCall(0).args[1];
        assert.strictEqual(fetchOptions.headers['Content-Type'], 'application/json');
        assert.strictEqual(fetchOptions.body, '{"test":"body"}');
      });
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
      test('should throw', async function (assert) {
        // given
        jsonStub.resolves({ errors: [{ detail: 'the error message' }] });
        const response = { ok: false, json: jsonStub };
        fetchStub = sinon.stub().resolves(response);

        // when
        const promise = fileSaver.save({
          url,
          fileName: defaultFileName,
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
