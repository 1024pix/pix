// This file is a COPY of an original file from mon-pix.
// If you need a change, as much as possible modify the original file
// and propagate the changes in the copies in all the fronts

import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl, { setCurrentLocale } from '../../helpers/setup-intl.js';

const { DEFAULT_LOCALE } = ENV.APP;

module('Unit | Services | locale', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  let localeService;
  let currentDomainService;
  let metricsService;

  hooks.beforeEach(function () {
    localeService = this.owner.lookup('service:locale');
    sinon.stub(localeService, 'supportedLocales').value(['en', 'es', 'fr', 'nl', 'fr-BE', 'fr-FR', 'nl-BE']);

    currentDomainService = this.owner.lookup('service:currentDomain');
    sinon.stub(currentDomainService, 'getExtension');

    class metricsServiceStub extends Service {
      context = {};
    }
    this.owner.register('service:metrics', metricsServiceStub);
    metricsService = this.owner.lookup('service:metrics');
  });

  module('currentLocale', function () {
    module('when useLocale feature toggle is disabled', function () {
      test('returns the intl locale', function (assert) {
        // given
        const intlService = this.owner.lookup('service:intl');
        sinon.stub(intlService, 'primaryLocale').value('fr-BE');

        // when
        const currentLocale = localeService.currentLocale;

        // then
        assert.strictEqual(currentLocale, 'fr-BE');
      });
    });

    module('when useLocale feature toggle is enabled', function (hooks) {
      hooks.beforeEach(function () {
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ useLocale: true });
      });

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
  });

  module('pixLocales', function () {
    test('returns the locales available in the Pix Platform', function (assert) {
      // when
      const pixLocales = localeService.pixLocales;

      // then
      assert.deepEqual(pixLocales, ['en', 'es', 'fr', 'nl', 'fr-BE', 'fr-FR', 'nl-BE']);
    });
  });

  module('pixLanguages', function () {
    test('returns the languages available in the Pix Platform', function (assert) {
      // when
      const pixLanguages = localeService.pixLanguages;

      // then
      assert.deepEqual(pixLanguages, ['fr', 'en', 'nl', 'es']);
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

  module('isSupportedLocale', function () {
    module('when locale is supported', function () {
      test('returns true', function (assert) {
        // given
        const locale = 'nl-BE';

        // when
        const result = localeService.isSupportedLocale(locale);

        // then
        assert.true(result);
      });
    });

    module('when locale is supported but not given in canonical form', function () {
      test('returns true', function (assert) {
        // given
        const locale = 'nl-be';

        // when
        const result = localeService.isSupportedLocale(locale);

        // then
        assert.true(result);
      });
    });

    module('when locale is valid but not supported', function () {
      test('returns false', function (assert) {
        // given
        const locale = 'ko';

        // when
        const result = localeService.isSupportedLocale(locale);

        // then
        assert.false(result);
      });
    });

    module('when locale is invalid', function () {
      test('returns false', function (assert) {
        // given
        const locale = 'invalid_locale_in_bad_format';

        // when
        const result = localeService.isSupportedLocale(locale);

        // then
        assert.false(result);
      });
    });
  });

  module('setCurrentLocale', function () {
    module('when useLocale feature toggle is disabled', function () {
      test('set app locale', function (assert) {
        // given
        const dayjsService = this.owner.lookup('service:dayjs');
        sinon.stub(dayjsService, 'setLocale');
        const intlService = this.owner.lookup('service:intl');
        sinon.stub(intlService, 'setLocale');
        const locale = DEFAULT_LOCALE;

        // when
        localeService.setCurrentLocale(locale);

        // then
        sinon.assert.calledWith(intlService.setLocale, locale);
        sinon.assert.calledWith(dayjsService.setLocale, locale);
        assert.strictEqual(metricsService.context.locale, locale);
      });
    });

    module('when useLocale feature toggle is enabled', function (hooks) {
      hooks.beforeEach(function () {
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ useLocale: true });
      });

      test('set app locale in the cookies', function (assert) {
        // given
        const dayjsService = this.owner.lookup('service:dayjs');
        sinon.stub(dayjsService, 'setLocale');
        const intlService = this.owner.lookup('service:intl');
        sinon.stub(intlService, 'setLocale');
        const cookiesService = this.owner.lookup('service:cookies');
        sinon.stub(cookiesService, 'write');
        const locale = 'nl-BE';

        // when
        localeService.setCurrentLocale(locale);

        // then
        const currentLocale = localeService.currentLocale;
        assert.strictEqual(currentLocale, 'nl-BE');
        sinon.assert.calledWith(cookiesService.write, 'locale', 'nl-BE');
        sinon.assert.calledWith(intlService.setLocale, 'nl');
        sinon.assert.calledWith(dayjsService.setLocale, 'nl');
        assert.strictEqual(metricsService.context.locale, 'nl-BE');
      });
    });
  });

  module('setBestLocale', function () {
    module('when useLocale feature toggle is disabled', function () {
      module('when the current domain is "fr"', function () {
        test('sets the locale with "fr" and adds a cookie locale with "fr-FR"', function (assert) {
          // given
          const dayjsService = this.owner.lookup('service:dayjs');
          sinon.stub(dayjsService, 'setLocale');
          const intlService = this.owner.lookup('service:intl');
          sinon.stub(intlService, 'setLocale');
          const cookiesService = this.owner.lookup('service:cookies');
          sinon.stub(cookiesService, 'write');
          sinon.stub(cookiesService, 'exists').returns(false);
          currentDomainService.getExtension.returns('fr');

          // when
          localeService.setBestLocale({ queryParams: null, user: null });

          // then
          sinon.assert.calledWith(cookiesService.write, 'locale', 'fr-FR');
          sinon.assert.calledWith(intlService.setLocale, 'fr');
          sinon.assert.calledWith(dayjsService.setLocale, 'fr');
          assert.strictEqual(metricsService.context.locale, 'fr');
        });
      });

      module('when the current domain extension is "org"', function () {
        module('when no current user', function () {
          module('when there is no overriding language', function () {
            test('sets the the default locale', async function (assert) {
              // given
              const dayjsService = this.owner.lookup('service:dayjs');
              sinon.stub(dayjsService, 'setLocale');
              const intlService = this.owner.lookup('service:intl');
              sinon.stub(intlService, 'setLocale');
              currentDomainService.getExtension.returns('org');

              // when
              localeService.setBestLocale({ queryParams: null, user: null });

              // then
              sinon.assert.calledWith(intlService.setLocale, DEFAULT_LOCALE);
              sinon.assert.calledWith(dayjsService.setLocale, DEFAULT_LOCALE);
              assert.strictEqual(metricsService.context.locale, DEFAULT_LOCALE);
            });
          });

          module('when the overriding language is supported', function () {
            test('sets the locale with the overriding language', function (assert) {
              // given
              const dayjsService = this.owner.lookup('service:dayjs');
              sinon.stub(dayjsService, 'setLocale');
              const intlService = this.owner.lookup('service:intl');
              sinon.stub(intlService, 'setLocale');
              currentDomainService.getExtension.returns('org');
              const queryParams = { lang: 'es' };

              // when
              localeService.setBestLocale({ queryParams, user: null });

              // then
              sinon.assert.calledWith(intlService.setLocale, 'es');
              sinon.assert.calledWith(dayjsService.setLocale, 'es');
              assert.strictEqual(metricsService.context.locale, 'es');
            });
          });

          module('when the overriding language is not supported', function () {
            test('sets the default locale', function (assert) {
              // given
              const dayjsService = this.owner.lookup('service:dayjs');
              sinon.stub(dayjsService, 'setLocale');
              const intlService = this.owner.lookup('service:intl');
              sinon.stub(intlService, 'setLocale');
              currentDomainService.getExtension.returns('org');
              const queryParams = { lang: 'xxx' };

              // when
              localeService.setBestLocale({ queryParams, user: null });

              // then
              sinon.assert.calledWith(intlService.setLocale, DEFAULT_LOCALE);
              sinon.assert.calledWith(dayjsService.setLocale, DEFAULT_LOCALE);
              assert.strictEqual(metricsService.context.locale, DEFAULT_LOCALE);
            });
          });
        });

        module('when user is loaded', function () {
          module('when there is no overriding language', function () {
            module('when the user language is supported', function () {
              test('sets the locale with the user language', async function (assert) {
                // given
                const dayjsService = this.owner.lookup('service:dayjs');
                sinon.stub(dayjsService, 'setLocale');
                const intlService = this.owner.lookup('service:intl');
                sinon.stub(intlService, 'setLocale');
                currentDomainService.getExtension.returns('org');
                const user = { lang: 'nl' };

                // when
                localeService.setBestLocale({ queryParams: null, user });

                // then
                sinon.assert.calledWith(intlService.setLocale, 'nl');
                sinon.assert.calledWith(dayjsService.setLocale, 'nl');
                assert.strictEqual(metricsService.context.locale, 'nl');
              });
            });

            module('when the user language is not supported', function () {
              test('sets the default locale', async function (assert) {
                // given
                const dayjsService = this.owner.lookup('service:dayjs');
                sinon.stub(dayjsService, 'setLocale');
                const intlService = this.owner.lookup('service:intl');
                sinon.stub(intlService, 'setLocale');
                currentDomainService.getExtension.returns('org');
                const user = { lang: 'tlh' }; // tlh: Klingon locale

                // when
                localeService.setBestLocale({ queryParams: null, user });

                // then
                sinon.assert.calledWith(intlService.setLocale, DEFAULT_LOCALE);
                sinon.assert.calledWith(dayjsService.setLocale, DEFAULT_LOCALE);
                assert.strictEqual(metricsService.context.locale, DEFAULT_LOCALE);
              });
            });
          });

          module('when the overriding language is given', function () {
            test('sets the locale with the overriding language', function (assert) {
              // given
              const dayjsService = this.owner.lookup('service:dayjs');
              sinon.stub(dayjsService, 'setLocale');
              const intlService = this.owner.lookup('service:intl');
              sinon.stub(intlService, 'setLocale');
              currentDomainService.getExtension.returns('org');
              const user = { lang: 'nl' };
              const queryParams = { lang: 'es' };

              // when
              localeService.setBestLocale({ queryParams, user });

              // then
              sinon.assert.calledWith(intlService.setLocale, 'es');
              sinon.assert.calledWith(dayjsService.setLocale, 'es');
              assert.strictEqual(metricsService.context.locale, 'es');
            });
          });
        });
      });
    });

    module('when useLocale feature toggle is enabled', function (hooks) {
      hooks.beforeEach(function () {
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ useLocale: true });
      });

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
  });

  module('pixChallengeLocales', function () {
    test('returns the locales as present in the challenges of the Pix platform', function (assert) {
      // when
      const pixChallengeLocales = localeService.pixChallengeLocales;

      // then
      assert.deepEqual(pixChallengeLocales, ['en', 'fr', 'fr-fr', 'nl', 'es', 'it', 'de']);
    });
  });

  module('switcherDisplayedLanguages', function () {
    module('when supportedLocales contains all the pixLanguages', function () {
      test('returns all the pixLanguages that should be displayed in the switcher with french first', function (assert) {
        // when
        const switcherDisplayedLanguages = localeService.switcherDisplayedLanguages;

        // then
        assert.deepEqual(switcherDisplayedLanguages, [
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'English' },
          { value: 'nl', label: 'Nederlands' },
        ]);
      });
    });

    module('when supportedLocales does not contain all the pixLanguages', function () {
      test('returns the pixLanguages part of the supportedLocales that should be displayed in the switcher with french first', function (assert) {
        // when
        sinon.stub(localeService, 'supportedLocales').value(['en', 'fr']);
        const switcherDisplayedLanguages = localeService.switcherDisplayedLanguages;

        // then
        assert.deepEqual(switcherDisplayedLanguages, [
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'English' },
        ]);
      });
    });
  });
});
