import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  load = sinon.stub();
}
class FeatureTogglesStub extends Service {
  load = sinon.stub().resolves();
}

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  test('it should load the current user', async function (assert) {
    // given
    const transition = { to: { queryParams: { lang: 'fr' } } };
    this.owner.register('service:current-user', CurrentUserStub);
    this.owner.register('service:feature-toggles', FeatureTogglesStub);

    const route = this.owner.lookup('route:application');

    // when
    await route.beforeModel(transition);

    // then
    assert.ok(route.currentUser.load.called);
  });

  module('#handleLocale', function () {
    module('when domain is fr', function () {
      test('it should update the locale to fr-fr', async function (assert) {
        // given
        const intlSetLocaleStub = sinon.stub();
        const momentSetLocaleStub = sinon.stub();
        const momentStub = Service.create({
          setLocale: momentSetLocaleStub,
        });
        const intlStub = Service.create({
          setLocale: intlSetLocaleStub,
        });
        const currentDomainStub = {
          getExtension: () => 'fr',
        };
        const route = this.owner.lookup('route:application');

        route.set('intl', intlStub);
        route.set('currentDomain', currentDomainStub);
        route.set('moment', momentStub);

        // when
        await route.handleLocale('fr');

        // then
        assert.expect(0);
        sinon.assert.calledWith(intlSetLocaleStub, ['fr-fr', 'fr']);
      });
    });

    module('when domain is org', function () {
      test('it should update the locale to fr', async function (assert) {
        // given
        const intlSetLocaleStub = sinon.stub();
        const momentSetLocaleStub = sinon.stub();
        const momentStub = Service.create({
          setLocale: momentSetLocaleStub,
        });
        const intlStub = Service.create({
          setLocale: intlSetLocaleStub,
        });
        const currentDomainStub = {
          getExtension: () => 'org',
        };
        const route = this.owner.lookup('route:application');

        route.set('intl', intlStub);
        route.set('currentDomain', currentDomainStub);
        route.set('moment', momentStub);

        // when
        await route.handleLocale('fr');

        // then
        assert.expect(0);
        sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
      });
    });
  });
});
