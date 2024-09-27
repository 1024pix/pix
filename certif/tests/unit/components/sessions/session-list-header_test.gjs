import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | sessions | session-list-header', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:sessions/session-list-header');
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
          class CurrentDomainStub extends Service {
            getExtension = sinon.stub().returns('org');
          }
          class IntlStub extends Service {
            primaryLocale = 'fr';
          }

          this.owner.register('service:current-domain', CurrentDomainStub);
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
          class CurrentDomainStub extends Service {
            getExtension = sinon.stub().returns('org');
          }
          class IntlStub extends Service {
            primaryLocale = 'en';
          }

          this.owner.register('service:current-domain', CurrentDomainStub);
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
        class CurrentDomainStub extends Service {
          getExtension = sinon.stub().returns('fr');
        }
        class IntlStub extends Service {
          primaryLocale = 'fr';
        }

        this.owner.register('service:current-domain', CurrentDomainStub);
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
