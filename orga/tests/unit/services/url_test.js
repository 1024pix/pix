import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';
import sinon from 'sinon';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#isFrenchDomainExtension', function () {
    test('should have a frenchDomainExtension when the current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const domainExtension = service.isFrenchDomainExtension;

      // then
      assert.true(domainExtension);
    });

    test('should not have frenchDomainExtension when the current domain contains pix.org', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.currentDomain = { getExtension: sinon.stub().returns('org') };

      // when
      const domainExtension = service.isFrenchDomainExtension;

      // then
      assert.false(domainExtension);
    });
  });

  module('#campaignsRootUrl', function () {
    test('should get default campaigns root url when is defined', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.definedCampaignsRootUrl = 'pix.test.fr';

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.equal(campaignsRootUrl, service.definedCampaignsRootUrl);
    });

    test('should get "pix.test" url when current domain contains pix.test', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCampaignsRootUrl = 'https://app.pix.test/campagnes/';
      service.definedCampaignsRootUrl = undefined;
      service.currentDomain = { getExtension: sinon.stub().returns('test') };

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.equal(campaignsRootUrl, expectedCampaignsRootUrl);
    });
  });

  module('#homeUrl', function () {
    test('should call intl to get first locale configured', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      sinon.spy(this.intl, 'get');

      // when
      service.homeUrl;

      // then
      assert.ok(this.intl.get.calledWith('primaryLocale'));
    });

    test('should return home url with current locale', function (assert) {
      // given
      const currentLocale = 'en';
      this.intl.setLocale([currentLocale, 'fr']);

      const service = this.owner.lookup('service:url');
      const expectedHomeUrl = `${service.definedHomeUrl}?lang=${currentLocale}`;

      // when
      const homeUrl = service.homeUrl;

      // then
      assert.equal(homeUrl, expectedHomeUrl);
    });
  });

  module('#legalNoticeUrl', function () {
    test('should get "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.fr/mentions-legales';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const url = service.legalNoticeUrl;

      // then
      assert.equal(url, expectedUrl);
    });

    test('should get "pix.org" english url when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/en-gb/legal-notice';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('en') };

      // when
      const url = service.legalNoticeUrl;

      // then
      assert.equal(url, expectedUrl);
    });

    test('should get "pix.org" french url when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/mentions-legales';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const url = service.legalNoticeUrl;

      // then
      assert.equal(url, expectedUrl);
    });
  });

  module('#accessibilityUrl', function () {
    test('should get "pix.fr" when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.fr/accessibilite-pix-orga';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const url = service.accessibilityUrl;

      // then
      assert.equal(url, expectedUrl);
    });

    test('should get "pix.org" in english when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/en-gb/accessibility-pix-orga';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('en') };

      // when
      const url = service.accessibilityUrl;

      // then
      assert.equal(url, expectedUrl);
    });

    test('should get "pix.org" in french when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/accessibilite-pix-orga';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const url = service.accessibilityUrl;

      // then
      assert.equal(url, expectedUrl);
    });
  });
});
