import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Route | application', function(hooks) {

  setupTest(hooks);

  let prescriber;
  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');

    prescriber = store.createRecord('prescriber', { id: 1, lang: 'en' });
    prescriber.save = sinon.stub();
    prescriber.rollbackAttributes = sinon.stub();
  });

  module('sessionAuthenticated', function() {

    test('should set locale to default french locale if lang parameter is not exist', async function(assert) {
      // given
      prescriber.save.resolves();
      const currentUser = Service.create({
        load: sinon.stub(),
        prescriber,
      });
      currentUser.load.resolves(prescriber);

      const urlStub = Service.create({
        isFrenchDomainExtension: false,
      });
      const intlStub = Service.create({
        setLocale: sinon.stub(),
        get: sinon.stub(),
      });
      intlStub.get.withArgs('locales').returns(['en', 'fr']);
      const momentStub = Service.create({
        setLocale: sinon.stub(),
      });

      const route = this.owner.lookup('route:application');
      route.set('transitionTo', sinon.stub());
      route.set('currentUser', currentUser);
      route.set('url', urlStub);
      route.set('intl', intlStub);
      route.set('moment', momentStub);

      // when
      await route.sessionAuthenticated();

      // then
      assert.ok(route.intl.setLocale.calledWith(['fr', 'fr']));
      assert.ok(route.moment.setLocale.calledWith('fr'));
    });

    test('it should load current user', async function(assert) {
      // given
      prescriber.save.resolves();
      const currentUser = Service.create({
        load: sinon.stub(),
        prescriber,
      });
      currentUser.load.resolves(prescriber);

      const route = this.owner.lookup('route:application');
      route.set('transitionTo', sinon.stub());
      route.set('currentUser', currentUser);

      // when
      await route.sessionAuthenticated();

      // then
      assert.ok(route.currentUser.load.called);
    });

    test('it should transition to "routeAfterAuthenticated"', async function(assert) {
      // given
      prescriber.save.resolves();
      const currentUser = Service.create({
        load: sinon.stub(),
        prescriber,
      });
      currentUser.load.resolves(prescriber);

      const route = this.owner.lookup('route:application');
      route.set('transitionTo', sinon.stub());
      route.set('currentUser', currentUser);
      route.routeAfterAuthentication = 'some route';

      // when
      await route.sessionAuthenticated();

      // then
      assert.ok(route.transitionTo.calledWith('some route'));
    });
  });

  module('beforeModel', function(hooks) {

    hooks.beforeEach(function() {
      class FeatureTogglesMock extends Service {
        load = sinon.stub();
      }
      this.owner.register('service:feature-toggles', FeatureTogglesMock);
    });

    module('Setting prescriber lang', function() {

      module('When lang param exist', function() {

        test('should update prescriber if lang param is different from prescriber lang', async function(assert) {
          // given
          const transition = { to: { queryParams: { lang: 'fr' } } };

          prescriber.save.resolves();
          const currentUser = Service.create({
            load: sinon.stub(),
            prescriber,
          });
          currentUser.load.resolves(prescriber);

          const route = this.owner.lookup('route:application');
          route.set('currentUser', currentUser);

          // when
          await route.beforeModel(transition);

          // then
          assert.ok(
            route.currentUser.prescriber.save.calledWith({ adapterOptions: { lang: 'fr' } }),
          );
          assert.equal(route.currentUser.prescriber.lang, 'fr');
        });

        test('should not update prescriber if lang param is the same as the prescriber lang', async function(assert) {
          // given
          const transition = { to: { queryParams: { lang: 'en' } } };

          prescriber.save.resolves();
          const currentUser = Service.create({
            load: sinon.stub(),
            prescriber,
          });
          currentUser.load.resolves(prescriber);

          const route = this.owner.lookup('route:application');
          route.set('currentUser', currentUser);

          // when
          await route.beforeModel(transition);

          // then
          assert.notOk(route.currentUser.prescriber.save.called);
          assert.equal(route.currentUser.prescriber.lang, 'en');
        });

        test('should call rollback prescriber attributes if update return error with http status 400', async function(assert) {
          // given
          const transition = { to: { queryParams: { lang: 'wrongLanguage' } } };

          const error = {
            errors: [{ status: '400' }],
          };
          prescriber.save.rejects(error);
          prescriber.rollbackAttributes.resolves();
          const currentUser = Service.create({
            load: sinon.stub(),
            prescriber,
          });
          currentUser.load.resolves(prescriber);

          const route = this.owner.lookup('route:application');
          route.set('currentUser', currentUser);

          // when
          await route.beforeModel(transition);

          // then
          assert.ok(route.currentUser.prescriber.rollbackAttributes.called);
        });
      });
    });

    module('Setting locale', function() {

      test('should set locale to fr if domain extension is fr', async function(assert) {
        // given
        const transition = { to: { queryParams: { lang: 'en' } } };

        prescriber.save.resolves();
        const currentUser = Service.create({
          load: sinon.stub(),
          prescriber,
        });
        currentUser.load.resolves(prescriber);

        const urlStub = Service.create({
          isFrenchDomainExtension: true,
        });

        const intlStub = Service.create({
          setLocale: sinon.stub(),
        });
        const momentStub = Service.create({
          setLocale: sinon.stub(),
        });

        const route = this.owner.lookup('route:application');
        route.set('currentUser', currentUser);
        route.set('url', urlStub);
        route.set('intl', intlStub);
        route.set('moment', momentStub);

        // when
        await route.beforeModel(transition);

        // then
        assert.ok(route.intl.setLocale.calledWith(['fr', 'fr']));
        assert.ok(route.moment.setLocale.calledWith('fr'));
      });

      test('should set locale to lang parameter if domain extension is not fr and lang is included into intl locales', async function(assert) {
        // given
        const transition = { to: { queryParams: { lang: 'en' } } };

        prescriber.lang = undefined;
        const currentUser = Service.create({
          load: sinon.stub(),
          prescriber,
        });
        currentUser.load.resolves(prescriber);

        const urlStub = Service.create({
          isFrenchDomainExtension: false,
        });

        const intlStub = Service.create({
          setLocale: sinon.stub(),
          get: sinon.stub(),
        });
        intlStub.get.withArgs('locales').returns(['en', 'fr']);
        const momentStub = Service.create({
          setLocale: sinon.stub(),
        });

        const route = this.owner.lookup('route:application');
        route.set('currentUser', currentUser);
        route.set('url', urlStub);
        route.set('intl', intlStub);
        route.set('moment', momentStub);

        // when
        await route.beforeModel(transition);

        // then
        assert.ok(route.intl.setLocale.calledWith(['en', 'fr']));
        assert.ok(route.moment.setLocale.calledWith('en'));
      });

      test('should set locale to fr if domain extension is not fr and lang parameter is not included into intl locales', async function(assert) {
        // given
        const transition = { to: { queryParams: { lang: 'en-GB' } } };

        prescriber.lang = undefined;
        const currentUser = Service.create({
          load: sinon.stub(),
          prescriber,
        });
        currentUser.load.resolves(prescriber);

        const urlStub = Service.create({
          isFrenchDomainExtension: false,
        });

        const intlStub = Service.create({
          setLocale: sinon.stub(),
          get: sinon.stub(),
        });
        intlStub.get.withArgs('locales').returns(['en', 'fr']);
        const momentStub = Service.create({
          setLocale: sinon.stub(),
        });

        const route = this.owner.lookup('route:application');
        route.set('currentUser', currentUser);
        route.set('url', urlStub);
        route.set('intl', intlStub);
        route.set('moment', momentStub);

        // when
        await route.beforeModel(transition);

        // then
        assert.ok(route.intl.setLocale.calledWith(['fr', 'fr']));
        assert.ok(route.moment.setLocale.calledWith('fr'));
      });
    });

    test('it should load the current user', async function(assert) {
      // given
      const transition = { to: { queryParams: {} } };

      const currentUser = Service.create({
        load: sinon.stub(),
        prescriber,
      });
      currentUser.load.resolves(prescriber);

      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUser);

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(route.currentUser.load.called);
    });

    test('it should load feature toggles', async function(assert) {
      // given
      const transition = { to: { queryParams: {} } };

      const currentUser = Service.create({
        load: sinon.stub(),
        prescriber,
      });
      currentUser.load.resolves(prescriber);

      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUser);

      const featureTogglesService = this.owner.lookup('service:feature-toggles');

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(featureTogglesService.load.called);
    });
  });
});
