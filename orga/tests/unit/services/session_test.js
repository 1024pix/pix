import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | session', function (hooks) {
  setupTest(hooks);

  module('#handlePrescriberLanguageAndLocale', function () {
    module('when there is not prescriber', function () {
      test('should call current user and set fr locale by default', async function (assert) {
        // given
        const service = this.owner.lookup('service:session');

        service.currentUser = {
          load: sinon.stub(),
        };
        service.url = {
          isFrenchDomainExtension: true,
        };
        service.intl = {
          setLocale: sinon.stub(),
        };
        service.moment = {
          setLocale: sinon.stub(),
        };

        // when
        await service.handlePrescriberLanguageAndLocale();

        // then
        assert.ok(service.currentUser.load.called);
        assert.ok(service.intl.setLocale.calledWith(['fr', 'fr']));
        assert.ok(service.moment.setLocale.calledWith('fr'));
      });

      module('when domain extension is not .fr', function () {
        test('should set locale to en when language parameter is en', async function (assert) {
          // given
          const service = this.owner.lookup('service:session');

          service.currentUser = {
            load: sinon.stub(),
          };
          service.url = {
            isFrenchDomainExtension: false,
          };
          service.intl = {
            setLocale: sinon.stub(),
            get: sinon.stub().withArgs('locales').returns(['fr', 'en']),
          };
          service.moment = {
            setLocale: sinon.stub(),
          };

          // when
          await service.handlePrescriberLanguageAndLocale('en');

          // then
          assert.ok(service.intl.setLocale.calledWith(['en', 'fr']));
          assert.ok(service.moment.setLocale.calledWith('en'));
        });
      });
    });

    module('when there is a prescriber', function () {
      test('should update prescriber lang when it is different of language parameter', async function (assert) {
        // given
        const service = this.owner.lookup('service:session');

        service.currentUser = {
          load: sinon.stub(),
          prescriber: {
            lang: 'fr',
            save: sinon.stub(),
          },
        };
        service.url = {
          isFrenchDomainExtension: true,
        };
        service.intl = {
          setLocale: sinon.stub(),
        };
        service.moment = {
          setLocale: sinon.stub(),
        };

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
      // when
      const service = this.owner.lookup('service:session');

      // then
      assert.ok(service.handleAuthentication instanceof Function);
    });
  });

  module('#handleInvalidation', function () {
    test('should override handleInvalidation method', function (assert) {
      // when
      const service = this.owner.lookup('service:session');

      // then
      assert.ok(service.handleInvalidation instanceof Function);
    });
  });
});
