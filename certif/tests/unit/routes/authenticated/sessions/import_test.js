import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/sessions/import', function (hooks) {
  setupTest(hooks);

  module('when top level domain is org', function () {
    module('when current language is french', function () {
      test('it should not redirect to sessions list page', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          isRelatedToManagingStudentsOrganization: false,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }
        class FeatureTogglesStub extends Service {
          featureToggles = { isMassiveSessionManagementEnabled: sinon.stub().returns(true) };
        }
        class CurrentDomainStub extends Service {
          getExtension = sinon.stub().returns('org');
        }
        class IntlStub extends Service {
          t = sinon.stub().returns('fr');
        }
        class RouterStub extends Service {
          replaceWith = sinon.stub().resolves();
        }

        this.owner.register('service:router', RouterStub);
        this.owner.register('service:feature-toggles', FeatureTogglesStub);
        this.owner.register('service:current-domain', CurrentDomainStub);
        this.owner.register('service:intl', IntlStub);
        this.owner.register('service:current-user', CurrentUserStub);
        const route = this.owner.lookup('route:authenticated/sessions/import');

        // when
        route.beforeModel();

        // then
        assert.notOk(route.router.replaceWith.calledWith('authenticated.sessions.list'));
      });
    });

    module('when current language is english', function () {
      test('it should redirect to sessions list page', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          isRelatedToManagingStudentsOrganization: false,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }
        class FeatureTogglesStub extends Service {
          featureToggles = { isMassiveSessionManagementEnabled: sinon.stub().returns(true) };
        }
        class CurrentDomainStub extends Service {
          getExtension = sinon.stub().returns('org');
        }
        class IntlStub extends Service {
          t = sinon.stub().returns('en');
        }
        class RouterStub extends Service {
          replaceWith = sinon.stub().resolves();
        }

        this.owner.register('service:router', RouterStub);
        this.owner.register('service:feature-toggles', FeatureTogglesStub);
        this.owner.register('service:current-domain', CurrentDomainStub);
        this.owner.register('service:intl', IntlStub);
        this.owner.register('service:current-user', CurrentUserStub);
        const route = this.owner.lookup('route:authenticated/sessions/import');

        // when
        route.beforeModel();

        // then
        assert.ok(route.router.replaceWith.calledWith('authenticated.sessions.list'));
      });
    });
  });

  module('when top level domain is fr', function () {
    test('it should not redirect to sessions list page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        type: 'SUP',
        isRelatedToManagingStudentsOrganization: false,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      class FeatureTogglesStub extends Service {
        featureToggles = { isMassiveSessionManagementEnabled: sinon.stub().returns(true) };
      }
      class CurrentDomainStub extends Service {
        getExtension = sinon.stub().returns('fr');
      }
      class IntlStub extends Service {
        t = sinon.stub().returns('fr');
      }
      class RouterStub extends Service {
        replaceWith = sinon.stub().resolves();
      }

      this.owner.register('service:router', RouterStub);
      this.owner.register('service:feature-toggles', FeatureTogglesStub);
      this.owner.register('service:current-domain', CurrentDomainStub);
      this.owner.register('service:intl', IntlStub);
      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated/sessions/import');

      // when
      route.beforeModel();

      // then
      assert.notOk(route.router.replaceWith.calledWith('authenticated.sessions.list'));
    });
  });
});
