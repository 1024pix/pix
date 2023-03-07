import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('Unit | Component | no-session-panel', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:no-session-panel');
  });

  module('#shouldRenderImportTemplateButton', function () {
    module('when top level domain is org', function () {
      module('when current language is french', function () {
        test('should render import template button', async function (assert) {
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

          this.owner.register('service:current-domain', CurrentDomainStub);
          this.owner.register('service:featureToggles', FeatureTogglesStub);
          this.owner.register('service:current-user', CurrentUserStub);
          this.owner.register('service:intl', IntlStub);

          // when
          const isRenderImportTemplateButton = component.shouldRenderImportTemplateButton;

          // then
          assert.true(isRenderImportTemplateButton);
        });
      });
      module('when current language is english', function () {
        test('should not render import template button', async function (assert) {
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

          this.owner.register('service:current-domain', CurrentDomainStub);
          this.owner.register('service:featureToggles', FeatureTogglesStub);
          this.owner.register('service:current-user', CurrentUserStub);
          this.owner.register('service:intl', IntlStub);

          // when
          const isRenderImportTemplateButton = component.shouldRenderImportTemplateButton;

          // then
          assert.false(isRenderImportTemplateButton);
        });
      });
    });

    module('when top level domain is fr', function () {
      test('should render import template button', async function (assert) {
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

        this.owner.register('service:current-domain', CurrentDomainStub);
        this.owner.register('service:featureToggles', FeatureTogglesStub);
        this.owner.register('service:current-user', CurrentUserStub);
        this.owner.register('service:intl', IntlStub);

        // when
        const isRenderImportTemplateButton = component.shouldRenderImportTemplateButton;

        // then
        assert.true(isRenderImportTemplateButton);
      });
    });
  });
});
