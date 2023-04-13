import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | session', function (hooks) {
  setupTest(hooks);

  let service;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:session');

    service.currentUser = {
      load: sinon.stub(),
    };
    service.url = {
      isFrenchDomainExtension: sinon.stub(),
    };
    service.intl = {
      setLocale: sinon.stub(),
      get: sinon.stub(),
    };
    service.dayjs = {
      setLocale: sinon.stub(),
      self: {
        locale: sinon.stub(),
      },
    };

    service.locale = {
      setLocaleCookie: sinon.stub(),
      hasLocaleCookie: sinon.stub(),
    };
    service.currentDomain = {
      getExtension: sinon.stub(),
    };
  });

  module('#handlePrescriberLanguageAndLocale', function () {
    module('when there is not prescriber', function () {
      test('should call current user and set fr locale by default', async function (assert) {
        // given
        service.url.isFrenchDomainExtension.returns(true);

        // when
        await service.handlePrescriberLanguageAndLocale();

        // then
        assert.ok(service.currentUser.load.called);
        assert.ok(service.intl.setLocale.calledWith(['fr', 'fr']));
        assert.ok(service.dayjs.setLocale.calledWith('fr'));
      });

      module('when domain extension is not .fr', function () {
        test('should set locale to en when language parameter is en', async function (assert) {
          // given
          service.url = {
            isFrenchDomainExtension: false,
          };
          service.intl.get.withArgs('locales').returns(['fr', 'en']);

          // when
          await service.handlePrescriberLanguageAndLocale('en');

          // then
          assert.ok(service.intl.setLocale.calledWith(['en', 'fr']));
          assert.ok(service.dayjs.setLocale.calledWith('en'));
        });
      });
    });

    module('when there is a prescriber', function () {
      test('should update prescriber lang when it is different of language parameter', async function (assert) {
        // given
        service.currentUser = {
          load: sinon.stub(),
          prescriber: {
            lang: 'fr',
            save: sinon.stub(),
          },
        };
        service.url.isFrenchDomainExtension.returns(true);

        // when
        await service.handlePrescriberLanguageAndLocale('en');

        // then
        assert.ok(
          service.currentUser.prescriber.save.calledWith({
            adapterOptions: {
              lang: 'en',
            },
          })
        );
      });
    });
  });

  module('#handleAuthentication', function () {
    test('should override handleAuthentication method', function (assert) {
      // when & then
      assert.ok(service.handleAuthentication instanceof Function);
    });
  });

  module('#handleInvalidation', function () {
    test('should override handleInvalidation method', function (assert) {
      // when & then
      assert.ok(service.handleInvalidation instanceof Function);
    });
  });

  module('when the current domain  is "fr"', function () {
    module('when there is no cookie locale', function () {
      test('add a cookie locale with "fr-FR" as value', async function (assert) {
        // given
        service.locale.hasLocaleCookie.returns(false);
        service.currentDomain.getExtension.returns('fr');

        // when
        await service.handlePrescriberLanguageAndLocale();

        // then
        sinon.assert.calledWith(service.locale.setLocaleCookie, 'fr-FR');
        assert.ok(true);
      });
    });

    module('when there is a cookie locale', function () {
      test('does not update cookie locale', async function (assert) {
        // given
        service.locale.hasLocaleCookie.returns(true);
        service.currentDomain.getExtension.returns('fr');

        // when
        await service.handlePrescriberLanguageAndLocale();

        // then
        sinon.assert.notCalled(service.locale.setLocaleCookie);
        assert.ok(true);
      });
    });
  });
});
