import * as i18nPlugin from '../../../../src/shared/infrastructure/plugins/i18n.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { getI18n } from '../../../tooling/i18n/i18n.js';

describe('Integration | Infrastructure | plugins | i18n', function () {
  let httpTestServer;
  let handlerStub;

  describe('validate the i18n configuration', function () {
    let i18n;

    before(function () {
      i18n = getI18n();
    });

    it('supports all Pix locales', async function () {
      // when
      const allLocales = i18n.getLocales();

      // then
      expect(allLocales).to.deep.equal(['en', 'fr', 'es', 'nl']);
    });

    it('returns fr as default locale', async function () {
      // when
      const result = i18n.__('email-sender-name.pix-app');

      // then
      expect(result).to.equal('PIX - Ne pas répondre');
    });

    it('fallbacks to fr locale when the locale is not supported', async function () {
      // when
      const result = i18n.__({ phrase: 'email-sender-name.pix-app', locale: 'foo' });

      // then
      expect(result).to.equal('PIX - Ne pas répondre');
    });

    it('interpolates parameters with single mustache', async function () {
      // when
      const result = i18n.__('Hello {name}', { name: 'Bob' });

      // then
      expect(result).to.equal('Hello Bob');
    });
  });

  describe('integrates the i18n plugin in HTTP server requests', function () {
    beforeEach(async function () {
      httpTestServer = new HttpTestServer();
      handlerStub = sinon.stub().returns({});

      await httpTestServer.register([i18nPlugin]);
      await httpTestServer.register({
        name: 'test-api',
        register: (server) => {
          server.route([{ method: 'GET', path: '/', config: { handler: handlerStub } }]);
        },
      });
    });

    it('uses the fr locale by default', async function () {
      // when
      await httpTestServer.request('GET', '/', null, null);

      // then
      const { i18n } = handlerStub.getCall(0).args[0];
      expect(i18n.__('email-sender-name.pix-app')).to.equal('PIX - Ne pas répondre');
    });

    it('returns the language defined by the header Accept-Language', async function () {
      // when
      await httpTestServer.request('GET', '/', null, null, { 'Accept-Language': 'en' });

      // then
      const { i18n } = handlerStub.getCall(0).args[0];
      expect(i18n.__('email-sender-name.pix-app')).to.equal('PIX - Noreply');
    });

    it('fallbacks to fr locale when the header Accept-Language locale is not supported', async function () {
      // when
      await httpTestServer.request('GET', '/', null, null, { 'Accept-Language': 'foo' });

      // then
      const { i18n } = handlerStub.getCall(0).args[0];
      expect(i18n.__('email-sender-name.pix-app')).to.equal('PIX - Ne pas répondre');
    });

    it('returns the language defined by the lang parameter', async function () {
      // when
      await httpTestServer.request('GET', '/?lang=en');

      // then
      const { i18n } = handlerStub.getCall(0).args[0];
      expect(i18n.__('email-sender-name.pix-app')).to.equal('PIX - Noreply');
    });
  });
});
