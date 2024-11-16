import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | request-manager', function (hooks) {
  setupTest(hooks);
  let requestManagerService;
  let sessionService;
  let currentDomainService;
  let intlService;

  hooks.beforeEach(function () {
    sinon.stub(window, 'fetch');

    requestManagerService = this.owner.lookup('service:requestManager');

    sessionService = this.owner.lookup('service:session');
    sinon.stub(sessionService, 'isAuthenticated').value(false);
    sinon.stub(sessionService, 'data').value(null);

    currentDomainService = this.owner.lookup('service:currentDomain');
    sinon.stub(currentDomainService, 'isFranceDomain').value(false);

    intlService = this.owner.lookup('service:intl');
    sinon.stub(intlService, 'primaryLocale').value('fr');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('request()', function () {
    test('it requests successfully with default headers', async function (assert) {
      // given
      window.fetch.resolves(responseMock({ status: 200, data: { foo: 'bar' } }));

      // when
      const result = await requestManagerService.request({ url: '/test', method: 'GET' });

      // then
      assert.strictEqual(result.response.status, 200);
      assert.deepEqual(result.content, { foo: 'bar' });

      const [url, { headers }] = window.fetch.getCall(0).args;
      assert.strictEqual(url, '/test');
      assert.strictEqual(headers.get('Accept-Language'), 'fr');
      assert.strictEqual(headers.get('X-App-Version'), 'development');
      assert.strictEqual(headers.get('Accept'), 'application/json');
      assert.strictEqual(headers.get('Content-Type'), 'application/json');
    });

    module('when user is authenticated', function () {
      test('it sets the Authorization header with the access token', async function (assert) {
        // given
        window.fetch.resolves(responseMock({ status: 200, data: { foo: 'bar' } }));
        sinon.stub(sessionService, 'isAuthenticated').value(true);
        sinon.stub(sessionService, 'data').value({ authenticated: { access_token: 'baz' } });

        // when
        await requestManagerService.request({ url: '/test', method: 'GET' });

        // then
        const [url, { headers }] = window.fetch.getCall(0).args;
        assert.strictEqual(url, '/test');
        assert.strictEqual(headers.get('Authorization'), 'Bearer baz');
      });
    });

    module('when it is on France domain', function () {
      test('it sets the header Accept-Language to fr-fr', async function (assert) {
        // given
        window.fetch.resolves(responseMock({ status: 200, data: { foo: 'bar' } }));
        sinon.stub(currentDomainService, 'isFranceDomain').value(true);

        // when
        await requestManagerService.request({ url: '/test', method: 'GET' });

        // then
        const [url, { headers }] = window.fetch.getCall(0).args;
        assert.strictEqual(url, '/test');
        assert.strictEqual(headers.get('Accept-Language'), 'fr-fr');
      });
    });

    module('when an error occured on HTTP call', function () {
      test('it throws an exception with error details', async function (assert) {
        // given
        window.fetch.resolves(responseMock({ status: 400, data: { error: 'KO' } }));

        // when
        assert.rejects(requestManagerService.request({ url: '/test', method: 'GET' }), function (err) {
          return err.status === 400 && err.content.error === 'KO';
        });
      });
    });
  });
});

function responseMock({ status, data }) {
  return new window.Response(JSON.stringify(data), { status });
}
