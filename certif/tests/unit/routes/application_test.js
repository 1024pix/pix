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
        const dayjsSetLocaleStub = sinon.stub();
        const intlStub = Service.create({
          setLocale: intlSetLocaleStub,
        });
        const dayjsStub = Service.create({
          setLocale: dayjsSetLocaleStub,
          self: { locale: sinon.stub() },
        });
        const currentDomainStub = {
          getExtension: () => 'fr',
        };
        const route = this.owner.lookup('route:application');

        route.set('intl', intlStub);
        route.set('dayjs', dayjsStub);
        route.set('currentDomain', currentDomainStub);

        // when
        await route.handleLocale('fr');

        // then
        assert.expect(0);
        sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
        sinon.assert.calledWith(dayjsSetLocaleStub, 'fr');
      });

      module('when there is no cookie locale', function () {
        test('add a cookie locale with "fr-FR" as value', async function (assert) {
          // given
          const localeServiceStub = Service.create({
            hasLocaleCookie: sinon.stub().returns(false),
            setLocaleCookie: sinon.stub(),
          });
          const currentDomainStub = {
            getExtension: () => 'fr',
          };
          const route = this.owner.lookup('route:application');

          route.set('locale', localeServiceStub);
          route.set('currentDomain', currentDomainStub);

          // when
          await route.handleLocale();

          // then
          sinon.assert.calledWith(localeServiceStub.setLocaleCookie, 'fr-FR');
          assert.ok(true);
        });
      });

      module('when there is a cookie locale', function () {
        test('does not update cookie locale', async function (assert) {
          // given
          const localeServiceStub = Service.create({
            hasLocaleCookie: sinon.stub().returns(true),
            setLocaleCookie: sinon.stub(),
          });
          const currentDomainStub = {
            getExtension: () => 'fr',
          };
          const route = this.owner.lookup('route:application');

          route.set('locale', localeServiceStub);
          route.set('currentDomain', currentDomainStub);

          // when
          await route.handleLocale();

          // then
          sinon.assert.notCalled(localeServiceStub.setLocaleCookie);
          assert.ok(true);
        });
      });
    });

    module('when domain is org', function () {
      test('it should update the locale to fr', async function (assert) {
        // given
        const intlSetLocaleStub = sinon.stub();
        const dayjsSetLocaleStub = sinon.stub();
        const dayjsStub = Service.create({
          setLocale: dayjsSetLocaleStub,
          self: { locale: sinon.stub() },
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
        route.set('dayjs', dayjsStub);

        // when
        await route.handleLocale('fr');

        // then
        assert.expect(0);
        sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
        sinon.assert.calledWith(dayjsSetLocaleStub, 'fr');
      });
    });
  });
});
