import { setupTest } from 'ember-qunit';
import ENV from 'pix-orga/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';
import { setCurrentLocale } from '../../helpers/setup-intl.js';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('legalNoticeUrl', function () {
    test('returns the Pix website legal notice URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const legalNoticeUrl = service.legalNoticeUrl;

      // then
      assert.strictEqual(legalNoticeUrl, 'https://pix.org/fr/mentions-legales');
    });

    test('returns the Pix website legal notice URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const legalNoticeUrl = service.legalNoticeUrl;

      // then
      assert.strictEqual(legalNoticeUrl, 'https://pix.org/en/legal-notice');
    });
  });

  module('cguUrl', function () {
    test('returns the Pix website CGU URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, 'https://pix.org/fr/conditions-generales-d-utilisation');
    });

    test('returns the Pix website CGU URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, 'https://pix.org/en/terms-and-conditions');
    });
  });

  module('dataProtectionPolicyUrl', function () {
    test('returns the Pix website data protection policy URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, 'https://pix.org/fr/pix-app-privacy-policy');
    });

    test('returns the Pix website data protection policy URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, 'https://pix.org/en/pix-app-privacy-policy');
    });
  });

  module('accessibilityUrl', function () {
    test('returns the Pix website accessibility URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const accessibilityUrl = service.accessibilityUrl;

      // then
      assert.strictEqual(accessibilityUrl, 'https://pix.org/fr/accessibilite-pix-orga');
    });

    test('returns the Pix website accessibility URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const accessibilityUrl = service.accessibilityUrl;

      // then
      assert.strictEqual(accessibilityUrl, 'https://pix.org/en/accessibility-pix-orga');
    });
  });

  module('#campaignsRootUrl', function () {
    test('returns default campaigns root url when is defined', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      sinon.stub(ENV, 'APP').value({ CAMPAIGNS_ROOT_URL: 'https://app.test.pix.fr/campagnes/' });

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.strictEqual(campaignsRootUrl, 'https://app.test.pix.fr/campagnes/');
    });

    test('returns campaigns root url for current pix-app environment', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      sinon
        .stub(ENV, 'APP')
        .value({ CAMPAIGNS_ROOT_URL: null, PIX_APP_URL_WITHOUT_EXTENSION: 'https://app.test.pix.' });

      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('org');

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.strictEqual(campaignsRootUrl, 'https://app.test.pix.org/campagnes/');
    });
  });

  module('#combinedCoursesRootUrl', function () {
    test('returns default combined courses root url when is defined', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      sinon.stub(ENV, 'APP').value({ COMBINED_COURSES_ROOT_URL: 'https://app.test.pix.fr/parcours/' });

      // when
      const combinedCoursesRootUrl = service.combinedCoursesRootUrl;

      // then
      assert.strictEqual(combinedCoursesRootUrl, 'https://app.test.pix.fr/parcours/');
    });
    test('returns combined courses root url for current pix-app environment', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      sinon.stub(ENV, 'APP').value({ PIX_APP_URL_WITHOUT_EXTENSION: 'https://app.test.pix.' });

      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('org');

      // when
      const combinedCoursesRootUrl = service.combinedCoursesRootUrl;

      // then
      assert.strictEqual(combinedCoursesRootUrl, 'https://app.test.pix.org/parcours/');
    });
  });

  module('#pixJuniorSchoolUrl', function () {
    test('returns pix junior url for current organization', function (assert) {
      const service = this.owner.lookup('service:url');

      service.currentUser = { organization: { schoolCode: 'MINIPIXOU' } };
      service.currentDomain = { getJuniorBaseUrl: () => 'https://junior.pix.fr' };

      const pixJuniorSchoolUrl = service.pixJuniorSchoolUrl;

      assert.strictEqual(pixJuniorSchoolUrl, 'https://junior.pix.fr/schools/MINIPIXOU');
    });
    test('returns empty string if the current organization has not any school code', function (assert) {
      const service = this.owner.lookup('service:url');
      service.currentUser = { organization: {} };
      service.currentDomain = { getJuniorBaseUrl: () => 'https://junior.pix.fr' };

      const pixJuniorSchoolUrl = service.pixJuniorSchoolUrl;

      assert.strictEqual(pixJuniorSchoolUrl, '');
    });
  });

  module('#pixJuniorUrl', function () {
    test('returns pix junior url for current organization', function (assert) {
      const service = this.owner.lookup('service:url');
      service.currentDomain = { getJuniorBaseUrl: () => 'https://junior.pix.fr' };

      assert.strictEqual(service.pixJuniorUrl, 'https://junior.pix.fr');
    });
  });

  module('#getLegalDocumentUrl', function () {
    test('returns the Pix legal document URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const accessibilityUrl = service.getLegalDocumentUrl('my-legal-document-path');

      // then
      assert.strictEqual(accessibilityUrl, 'https://pix.org/fr/my-legal-document-path');
    });

    test('returns the Pix legal document URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const accessibilityUrl = service.getLegalDocumentUrl('my-legal-document-path');

      // then
      assert.strictEqual(accessibilityUrl, 'https://pix.org/en/my-legal-document-path');
    });
  });

  module('#supportHelpCenterUrl', function () {
    [
      {
        locale: 'fr-FR',
        extension: 'fr',
        type: 'SCO-1D',
        expectedUrl: 'https://pix.fr/support/enseignement-scolaire/1er-degre',
      },
      { locale: 'fr-FR', extension: 'fr', type: 'SCO', expectedUrl: 'https://pix.fr/support/enseignement-scolaire' },
      { locale: 'fr-FR', extension: 'fr', type: 'SUP', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'fr-FR', extension: 'fr', type: 'PRO', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'fr', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/fr/support' },
      { locale: 'fr', extension: 'org', type: 'SCO', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'fr', extension: 'org', type: 'SUP', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'fr', extension: 'org', type: 'PRO', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'fr-BE', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/fr-be/support' },
      { locale: 'fr-BE', extension: 'org', type: 'SCO', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'fr-BE', extension: 'org', type: 'SUP', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'fr-BE', extension: 'org', type: 'PRO', expectedUrl: 'https://contact.pix.org/fr/hc/1137130200' },
      { locale: 'nl-BE', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/nl-be/support' },
      { locale: 'nl-BE', extension: 'org', type: 'SCO', expectedUrl: 'https://pix.org/nl-be/support' },
      { locale: 'nl-BE', extension: 'org', type: 'SUP', expectedUrl: 'https://pix.org/nl-be/support' },
      { locale: 'nl-BE', extension: 'org', type: 'PRO', expectedUrl: 'https://pix.org/nl-be/support' },
      { locale: 'en', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'en', extension: 'org', type: 'SCO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'en', extension: 'org', type: 'SUP', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'en', extension: 'org', type: 'PRO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'de-AT', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'de-AT', extension: 'org', type: 'SCO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'de-AT', extension: 'org', type: 'SUP', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'de-AT', extension: 'org', type: 'PRO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'it', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'it', extension: 'org', type: 'SCO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'it', extension: 'org', type: 'SUP', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'it', extension: 'org', type: 'PRO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es', extension: 'org', type: 'SCO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es', extension: 'org', type: 'SUP', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es', extension: 'org', type: 'PRO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es-419', extension: 'org', type: 'SCO-1D', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es-419', extension: 'org', type: 'SCO', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es-419', extension: 'org', type: 'SUP', expectedUrl: 'https://pix.org/en/support' },
      { locale: 'es-419', extension: 'org', type: 'PRO', expectedUrl: 'https://pix.org/en/support' },
    ].forEach(function ({ locale, extension, type, expectedUrl }) {
      test(`returns ${expectedUrl} for organization of type ${type} and locale ${locale}`, async function (assert) {
        const currentUser = this.owner.lookup('service:current-user');
        sinon.stub(currentUser, 'organization').value({ type });

        const domainService = this.owner.lookup('service:current-domain');
        sinon.stub(domainService, 'getExtension').returns(extension);

        const localeService = this.owner.lookup('service:locale');
        sinon.stub(localeService, 'currentLocale').value(locale);

        const service = this.owner.lookup('service:url');

        assert.strictEqual(service.supportHelpCenterUrl, expectedUrl);
      });
    });
  });
});
