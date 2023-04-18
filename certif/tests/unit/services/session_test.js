import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

const DEFAULT_LOCALE = 'fr';
const FRENCH_INTERNATIONAL_LOCALE = 'fr';
const FRENCH_FRANCE_LOCALE = 'fr-FR';

module('Unit | Service | session', function (hooks) {
  setupTest(hooks);

  let routerService;
  let sessionService;
  let localeService;

  hooks.beforeEach(function () {
    routerService = this.owner.lookup('service:router');
    routerService.transitionTo = sinon.stub();

    sessionService = this.owner.lookup('service:session');
    sessionService.currentUser = { load: sinon.stub(), certificationPointOfContact: null };

    localeService = this.owner.lookup('service:locale');
    Object.assign(localeService, {
      setLocaleCookie: sinon.stub(),
      hasLocaleCookie: sinon.stub(),
    });
  });

  module('#handleAuthentication', function () {
    test('calls handleLocale', async function (assert) {
      // given
      class UrlStub extends Service {
        get isFranceDomain() {
          return true;
        }
      }
      this.owner.register('service:url', UrlStub);

      sessionService.currentUser = {
        load: sinon.stub(),
        certificationPointOfContact: { isMemberOfACertificationCenter: false },
      };
      sessionService.handleLocale = sinon.stub();

      // when
      await sessionService.handleAuthentication();

      // then
      sinon.assert.called(sessionService.handleLocale);
      assert.ok(true);
    });
  });

  module('#handleLocale', function () {
    module('when domain is .fr', function () {
      module('when there is no cookie locale', function () {
        test('adds a cookie locale with "fr-FR" as value', async function (assert) {
          // given
          localeService.hasLocaleCookie.returns(false);

          // when
          const isFranceDomain = true;
          const localeFromQueryParam = undefined;
          const userLocale = undefined;
          await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

          // then
          sinon.assert.calledWith(localeService.setLocaleCookie, FRENCH_FRANCE_LOCALE);
          assert.ok(true);
        });
      });

      module('when there is a cookie locale', function () {
        test('does not update cookie locale', async function (assert) {
          // given
          localeService.hasLocaleCookie.returns(true);

          // when
          const isFranceDomain = true;
          const localeFromQueryParam = undefined;
          const userLocale = undefined;
          await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

          // then
          sinon.assert.notCalled(localeService.setLocaleCookie);
          assert.ok(true);
        });
      });

      module('when no lang query param', function () {
        module('when user is not loaded', function () {
          test('sets the locale to be French international in every case', async function (assert) {
            // given
            sessionService._setLocale = sinon.stub();

            // when
            const isFranceDomain = true;
            const localeFromQueryParam = undefined;
            const userLocale = undefined;
            await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

            // then
            sinon.assert.calledWith(sessionService._setLocale, FRENCH_INTERNATIONAL_LOCALE);
            assert.ok(true);
          });
        });

        module('when user is loaded', function () {
          test('sets the locale to be French international in every case', async function (assert) {
            // given
            sessionService._setLocale = sinon.stub();

            // when
            const isFranceDomain = true;
            const localeFromQueryParam = undefined;
            const userLocale = 'user’s lang';
            await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

            // then
            sinon.assert.calledWith(sessionService._setLocale, FRENCH_INTERNATIONAL_LOCALE);
            assert.ok(true);
          });
        });
      });

      module('when a lang query param is present', function () {
        module('when user is not loaded', function () {
          test('sets the locale to be French international in every case', async function (assert) {
            // given
            sessionService._setLocale = sinon.stub();

            // when
            const isFranceDomain = true;
            const localeFromQueryParam = 'en';
            const userLocale = undefined;
            await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

            // then
            sinon.assert.calledWith(sessionService._setLocale, FRENCH_INTERNATIONAL_LOCALE);
            assert.ok(true);
          });
        });

        module('when user is loaded', function () {
          test('sets the locale to be French international in every case', async function (assert) {
            // given
            sessionService._setLocale = sinon.stub();

            // when
            const isFranceDomain = true;
            const localeFromQueryParam = 'en';
            const userLocale = 'user’s lang';
            await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

            // then
            sinon.assert.calledWith(sessionService._setLocale, FRENCH_INTERNATIONAL_LOCALE);
            assert.ok(true);
          });
        });
      });
    });

    module('when domain is .org', function () {
      test('does not set the cookie locale', async function (assert) {
        // given
        localeService.hasLocaleCookie.returns(false);

        // when
        const isFranceDomain = false;
        const localeFromQueryParam = undefined;
        const userLocale = undefined;
        await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

        // then
        sinon.assert.notCalled(localeService.setLocaleCookie);
        assert.ok(true);
      });

      module('when no lang query param', function () {
        module('when user is not loaded', function () {
          test('sets the default locale', async function (assert) {
            // given
            sessionService._setLocale = sinon.stub();

            // when
            const isFranceDomain = false;
            const localeFromQueryParam = undefined;
            const userLocale = undefined;
            await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

            // then
            sinon.assert.calledWith(sessionService._setLocale, DEFAULT_LOCALE);
            assert.ok(true);
          });
        });

        module('when user is loaded', function () {
          test('sets the locale to the user’s lang', async function (assert) {
            // given
            sessionService._setLocale = sinon.stub();

            // when
            const isFranceDomain = false;
            const localeFromQueryParam = undefined;
            const userLocale = 'en';
            await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

            // then
            sinon.assert.calledWith(sessionService._setLocale, 'en');
            assert.ok(true);
          });
        });
      });

      module('when a lang query param is present', function () {
        module('when the lang query param is invalid', function () {
          module('when user is not loaded', function () {
            test('sets the default locale', async function (assert) {
              // given
              sessionService._setLocale = sinon.stub();

              // when
              const isFranceDomain = false;
              const localeFromQueryParam = 'an invalid locale';
              const userLocale = undefined;
              await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

              // then
              sinon.assert.calledWith(sessionService._setLocale, DEFAULT_LOCALE);
              assert.ok(true);
            });
          });

          module('when user is loaded', function () {
            test('sets the locale to the user’s lang', async function (assert) {
              // given
              sessionService._setLocale = sinon.stub();

              // when
              const isFranceDomain = false;
              const localeFromQueryParam = 'an invalid locale';
              const userLocale = 'en';
              await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

              // then
              sinon.assert.calledWith(sessionService._setLocale, 'en');
              assert.ok(true);
            });
          });
        });

        module('when the lang query param is valid', function () {
          module('when user is not loaded', function () {
            test('sets the locale to the lang query param', async function (assert) {
              // given
              sessionService._setLocale = sinon.stub();

              // when
              const isFranceDomain = false;
              const localeFromQueryParam = 'en';
              const userLocale = undefined;
              await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

              // then
              sinon.assert.calledWith(sessionService._setLocale, 'en');
              assert.ok(true);
            });
          });

          module('when user is loaded', function () {
            test('sets the locale to the lang query param which wins over', async function (assert) {
              // given
              sessionService._setLocale = sinon.stub();

              // when
              const isFranceDomain = false;
              const localeFromQueryParam = 'en';
              const userLocale = 'fr';
              await sessionService.handleLocale({ isFranceDomain, localeFromQueryParam, userLocale });

              // then
              sinon.assert.calledWith(sessionService._setLocale, 'en');
              assert.ok(true);
            });
          });
        });
      });
    });
  });

  module('#_setLocale', function () {
    test('calls intl and dayjs services', async function (assert) {
      // given
      sessionService.intl = { setLocale: sinon.stub() };
      sessionService.dayjs = { setLocale: sinon.stub(), self: { locale: sinon.stub() } };

      // when
      await sessionService._setLocale('some locale');

      // then
      sinon.assert.calledWith(sessionService.intl.setLocale, ['some locale', 'fr']);
      sinon.assert.calledWith(sessionService.dayjs.setLocale, 'some locale');
      sinon.assert.calledWith(sessionService.dayjs.self.locale, 'some locale');
      assert.ok(true);
    });
  });
});
