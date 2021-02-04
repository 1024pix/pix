import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Route | application', function(hooks) {
  setupTest(hooks);

  const saveStub = sinon.stub().resolves();
  const prescriber = {
    lang: 'en',
    save: saveStub,
  };

  module('sessionAuthenticated', function() {
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

  module('beforeModel', function() {
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

    test('should update user when there is lang param', async function(assert) {
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
      assert.ok(saveStub.calledWith({ adapterOptions: { lang: 'en' } }));
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
  });
});
