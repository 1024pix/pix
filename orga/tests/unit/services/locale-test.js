// This file is a COPY of an original file from mon-pix.
// If you need a change, as much as possible modify the original file
// and propagate the changes in the copies in all the fronts

import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setCurrentLocale } from '../../helpers/setup-intl.js';

const { DEFAULT_LOCALE } = ENV.APP;

module('Unit | Services | locale', function (hooks) {
  setupTest(hooks);

  let localeService;
  let currentDomainService;
  let metricsService;

  hooks.beforeEach(function () {
    localeService = this.owner.lookup('service:locale');
    sinon.stub(localeService, 'availableLocales').value(['en', 'es', 'fr', 'nl', 'fr-BE', 'fr-FR', 'nl-BE']);

    currentDomainService = this.owner.lookup('service:currentDomain');
    sinon.stub(currentDomainService, 'getExtension');

    class metricsServiceStub extends Service {
      context = {};
    }
    this.owner.register('service:metrics', metricsServiceStub);
    metricsService = this.owner.lookup('service:metrics');

    // sinon.stub(dayjs, 'locale');
  });

  module('currentLocale', function () {
    module('when current locale is not set', function () {
      test('returns the default locale', function (assert) {
        // when
        const currentLocale = localeService.currentLocale;

        // then
        assert.strictEqual(currentLocale, 'fr');
      });
    });

    module('when current locale is set', function () {
      test('returns the current locale', function (assert) {
        // given
        localeService.setCurrentLocale('fr-BE');

        // when
        const currentLocale = localeService.currentLocale;

        // then
        assert.strictEqual(currentLocale, 'fr-BE');
      });
    });
  });

  module('pixLocales', function () {
    test('returns the locales available in the Pix Platform', function (assert) {
      // when
      const pixLocales = localeService.pixLocales;

      // then
      assert.deepEqual(pixLocales, ['de-AT', 'en', 'es', 'es-419', 'fr', 'fr-BE', 'fr-FR', 'it', 'nl', 'nl-BE']);
    });
  });

  module('pixLanguages', function () {
    test('returns the languages available in the Pix Platform', function (assert) {
      // when
      const pixLanguages = localeService.pixLanguages;

      // then
      assert.deepEqual(pixLanguages, ['de', 'en', 'es', 'fr', 'it', 'nl']);
    });
  });

  module('acceptLanguageHeader', function () {
    module('when the domain is pix.fr', function () {
      test('always returns fr-FR', async function (assert) {
        // given
        currentDomainService.getExtension.returns('fr');
        await setCurrentLocale('en');

        // when
        const acceptLanguageHeader = localeService.acceptLanguageHeader;

        // then
        assert.strictEqual(acceptLanguageHeader, 'fr-FR');
      });
    });

    module('when the domain is pix.org', function () {
      test('always returns the current locale', async function (assert) {
        // given
        currentDomainService.getExtension.returns('org');
        await setCurrentLocale('nl');

        // when
        const acceptLanguageHeader = localeService.acceptLanguageHeader;

        // then
        assert.strictEqual(acceptLanguageHeader, 'nl');
      });
    });
  });

  module('setCurrentLocale', function () {
    test('set app locale in the cookies', async function (assert) {
      // given
      const intlService = this.owner.lookup('service:intl');
      sinon.stub(intlService, 'setLocale');
      const cookiesService = this.owner.lookup('service:cookies');
      sinon.stub(cookiesService, 'write');
      const locale = 'nl-BE';

      // when
      await localeService.setCurrentLocale(locale);

      // then
      const currentLocale = localeService.currentLocale;
      assert.strictEqual(currentLocale, 'nl-BE');
      sinon.assert.calledWith(cookiesService.write, 'locale', 'nl-BE');
      sinon.assert.calledWith(intlService.setLocale, ['nl-BE', 'nl', 'fr']);
      assert.strictEqual(metricsService.context.locale, 'nl-BE');
    });
  });

  module('setBestLocale', function () {
    module('when the current domain extension is "fr"', function (hooks) {
      hooks.beforeEach(function () {
        currentDomainService.getExtension.returns('fr');
      });

      test('returns fr-FR (and bypass the cookie)', async function (assert) {
        // given
        const cookiesService = this.owner.lookup('service:cookies');
        cookiesService.write('locale', 'nl');
        sinon.stub(cookiesService, 'write');

        // when
        localeService.setBestLocale({ queryParams: null });

        // then
        const currentLocale = localeService.currentLocale;
        assert.strictEqual(currentLocale, 'fr-FR');
      });
    });

    module('when the current domain extension is "org"', function (hooks) {
      hooks.beforeEach(function () {
        currentDomainService.getExtension.returns('org');
      });

      test('sets the default locale', async function (assert) {
        // given
        const cookiesService = this.owner.lookup('service:cookies');
        cookiesService.write('locale', '');
        sinon.stub(cookiesService, 'write');

        // when
        localeService.setBestLocale({ queryParams: null });

        // then
        const currentLocale = localeService.currentLocale;
        assert.strictEqual(currentLocale, DEFAULT_LOCALE);
      });

      module('when there is query param "lang"', function () {
        test('sets the locale with the "lang" query param (bypass the cookie)', async function (assert) {
          // given
          const cookiesService = this.owner.lookup('service:cookies');
          cookiesService.write('locale', 'fr');

          // when
          localeService.setBestLocale({ queryParams: { lang: 'fr-BE' } });

          // then
          const currentLocale = localeService.currentLocale;
          assert.strictEqual(currentLocale, 'fr-BE');
        });
      });

      module('when there is query param "locale"', function () {
        test('sets the locale with the "locale" query param (bypass the cookie)', async function (assert) {
          // given
          const cookiesService = this.owner.lookup('service:cookies');
          cookiesService.write('locale', 'fr');

          // when
          localeService.setBestLocale({ queryParams: { locale: 'fr-BE' } });

          // then
          const currentLocale = localeService.currentLocale;
          assert.strictEqual(currentLocale, 'fr-BE');
        });
      });

      module('when there is a cookie', function () {
        test('sets the locale with the "locale" cookie value', async function (assert) {
          // given
          const cookiesService = this.owner.lookup('service:cookies');
          cookiesService.write('locale', 'fr-BE');

          // when
          localeService.setBestLocale({ queryParams: null });

          // then
          const currentLocale = localeService.currentLocale;
          assert.strictEqual(currentLocale, 'fr-BE');
        });
      });

      module('when there is an unsupported cookie', function () {
        test('sets the nearest supported base language', async function (assert) {
          // given
          const cookiesService = this.owner.lookup('service:cookies');
          cookiesService.write('locale', 'en-CA');

          // when
          localeService.setBestLocale({ queryParams: null });

          // then
          const currentLocale = localeService.currentLocale;
          assert.strictEqual(currentLocale, 'en');
        });
      });

      module('when the detected locale is fr-FR', function () {
        test('always returns fr for not France domain', async function (assert) {
          // given
          const cookiesService = this.owner.lookup('service:cookies');
          cookiesService.write('locale', 'fr-FR');

          // when
          localeService.setBestLocale({ queryParams: null });

          // then
          const currentLocale = localeService.currentLocale;
          assert.strictEqual(currentLocale, 'fr');
        });
      });
    });
  });

  module('pixChallengeLocales', function () {
    test('returns the locales as present in the challenges of the Pix platform', function (assert) {
      // when
      const pixChallengeLocales = localeService.pixChallengeLocales;

      // then
      assert.deepEqual(pixChallengeLocales, ['de', 'de-AT', 'en', 'es', 'es-419', 'fr', 'fr-fr', 'it', 'nl']);
    });
  });

  module('switcherDisplayedLocales', function () {
    test('returns all the pixLocales that should be displayed in the switcher', function (assert) {
      // when
      const switcherDisplayedLocales = localeService.switcherDisplayedLocales;

      // then
      assert.deepEqual(switcherDisplayedLocales, [
        {
          label: 'Deutsch (Österreich)',
          value: 'de-AT',
        },
        {
          label: 'English',
          value: 'en',
        },
        {
          label: 'Español',
          value: 'es',
        },
        {
          label: 'Français',
          value: 'fr',
        },
        {
          label: 'Français (Belgique)',
          value: 'fr-BE',
        },
        {
          label: 'Italiano',
          value: 'it',
        },
        {
          label: 'Nederlands (België)',
          value: 'nl-BE',
        },
      ]);
    });
  });
});
