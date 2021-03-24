import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Route | application', (hooks) => {
  setupTest(hooks);

  let saveStub;
  let prescriber;
  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  module('sessionAuthenticated', (hooks) => {

    hooks.beforeEach(() => {
      saveStub = sinon.stub().resolves();
      prescriber = store.createRecord('prescriber', { id: 1, lang: 'en' });
      prescriber.save = saveStub;
    });

    test('should set locales', async function(assert) {
      // given
      const load = sinon.stub().resolves(prescriber);
      const currentUserStub = Service.create({ load, prescriber });
      const setLocaleStub = sinon.stub();
      const intlStub = Service.create({
        setLocale: setLocaleStub,
      });
      const transitionToStub = sinon.stub();
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('intl', intlStub);
      route.set('transitionTo', transitionToStub);

      // when
      await route.sessionAuthenticated();

      // then
      assert.ok(setLocaleStub.calledWith(['en', 'fr']));
    });

    test('it should load current user', async function(assert) {
      // given
      const loadStub = sinon.stub().resolves(prescriber);
      const currentUserStub = Service.create({ load: loadStub, prescriber });
      const transitionToStub = sinon.stub();
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('transitionTo', transitionToStub);

      // when
      await route.sessionAuthenticated();

      // then
      assert.ok(loadStub.called);
    });

    test('it should transition to "routeAfterAuthenticated"', async function(assert) {
      // given
      const loadStub = sinon.stub().resolves(prescriber);
      const currentUserStub = Service.create({ load: loadStub, prescriber });
      const transitionToStub = sinon.stub();
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('transitionTo', transitionToStub);
      route.routeAfterAuthentication = 'some route';

      // when
      await route.sessionAuthenticated();

      // then
      assert.ok(transitionToStub.calledWith('some route'));
    });
  });

  module('beforeModel', (hooks) => {

    hooks.beforeEach(function() {
      saveStub = sinon.stub().resolves();
      prescriber = store.createRecord('prescriber', { id: 1, lang: 'en' });
      prescriber.save = saveStub;
      class FeatureTogglesMock extends Service {
        load = sinon.stub();
      }
      this.owner.register('service:feature-toggles', FeatureTogglesMock);
    });

    test('should set the locales', async function(assert) {
      // given
      const transition = { to: { queryParams: {} } };
      const load = sinon.stub().resolves(prescriber);
      const currentUserStub = Service.create({ load, prescriber });
      const setLocaleStub = sinon.stub();
      const intlStub = Service.create({
        setLocale: setLocaleStub,
      });
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('intl', intlStub);

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(setLocaleStub.calledWith(['en', 'fr']));
    });

    test('should update user when there is lang param different from user lang', async function(assert) {
      // given
      const transition = { to: { queryParams: { lang: 'fr' } } };
      const load = sinon.stub().resolves(prescriber);
      const currentUserStub = Service.create({ load, prescriber });
      const setLocaleStub = sinon.stub();
      const intlStub = Service.create({
        setLocale: setLocaleStub,
      });
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('intl', intlStub);

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(saveStub.calledWith({ adapterOptions: { lang: 'fr' } }));
      assert.equal(prescriber.lang, 'fr');
    });

    test('should not update user lang when the passed lang param is the same as the user lang', async function(assert) {
      // given
      const transition = { to: { queryParams: { lang: 'en' } } };
      const load = sinon.stub().resolves(prescriber);
      const currentUserStub = Service.create({ load, prescriber });
      const setLocaleStub = sinon.stub();
      const intlStub = Service.create({
        setLocale: setLocaleStub,
      });
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('intl', intlStub);

      // when
      await route.beforeModel(transition);

      // then
      assert.notOk(saveStub.called);
      assert.equal(prescriber.lang, 'en');
    });

    test('it should load the current user', async function(assert) {
      // given
      const transition = { to: { queryParams: {} } };
      const loadStub = sinon.stub().resolves(prescriber);
      const currentUserStub = Service.create({ load: loadStub, prescriber });
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(loadStub.called);
    });

    test('it should load feature toggles', async function(assert) {
      // given
      const transition = { to: { queryParams: {} } };
      const currentUserStub = Service.create({ load: sinon.stub(), prescriber });
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      const featureTogglesService = this.owner.lookup('service:feature-toggles');
      const loadStub = sinon.stub();
      featureTogglesService.load = loadStub;

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(loadStub.called);
    });
  });
});
