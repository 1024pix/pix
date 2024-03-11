import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createComponent from '../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../helpers/setup-intl';

module('Unit | Component | routes/campaigns/join-sco-information-modal', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#constructor', function () {
    module('When reconciliation error is provided', function () {
      module('When error is a 422 status', function () {
        test('should set isAccountBelongingToAnotherUser to true', function (assert) {
          // given
          const reconciliationError = {
            status: '422',
          };

          // when
          const component = createComponent('routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          assert.true(component.isAccountBelongingToAnotherUser);
        });

        test('should not display continue button', function (assert) {
          // given
          const reconciliationError = {
            status: '422',
          };

          // when
          const component = createComponent('routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          assert.false(component.displayContinueButton);
        });

        test('should set is isInformationMode to false', function (assert) {
          // given
          const reconciliationError = {
            status: '422',
          };

          // when
          const component = createComponent('routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          assert.false(component.isInformationMode);
        });
      });

      module('When error is a 409 status', function () {
        const reconciliationError = {
          status: '409',
          meta: { shortCode: 'R11', value: 'j***@example.net', userId: 1 },
        };

        test('should set is isInformationMode to false', function (assert) {
          // when
          const component = createComponent('routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          assert.false(component.isInformationMode);
        });

        test('should display error message', function (assert) {
          // given
          const expectedErrorMessage = this.intl.t('api-error-messages.join-error.r11', {
            value: reconciliationError.meta.value,
            htmlSafe: true,
          });

          // when
          const component = createComponent('routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          assert.deepEqual(component.message, expectedErrorMessage);
        });

        module('When error is not related to samlId', function () {
          test('should display continue button', function (assert) {
            // given
            reconciliationError.meta.shortCode = 'R12';

            // when
            const component = createComponent('routes/campaigns/join-sco-information-modal', {
              reconciliationError,
            });

            // then
            assert.true(component.displayContinueButton);
          });
        });

        module('When error is related to samlId', function () {
          test('should not display continue button', function (assert) {
            // given
            reconciliationError.meta.shortCode = 'R13';

            // when
            const component = createComponent('routes/campaigns/join-sco-information-modal', {
              reconciliationError,
            });

            // then
            assert.false(component.displayContinueButton);
          });
        });
      });
    });

    module('When reconciliation warning is provided', function () {
      const reconciliationWarning = {
        connectionMethod: 'test@example.net',
        firstName: 'John',
        lastName: 'Doe',
      };

      test('should set is isInformationMode to true', function (assert) {
        // when
        const component = createComponent('routes/campaigns/join-sco-information-modal', {
          reconciliationWarning,
        });

        // then
        assert.true(component.isInformationMode);
      });

      test('should display an information message', function (assert) {
        // given
        const expectedWarningMessage = this.intl.t('pages.join.sco.login-information-message', {
          ...reconciliationWarning,
          htmlSafe: true,
        });

        // when
        const component = createComponent('routes/campaigns/join-sco-information-modal', {
          reconciliationWarning,
        });

        // then
        assert.deepEqual(component.message, expectedWarningMessage);
      });
    });
  });

  module('#goToCampaignConnectionForm', function () {
    test('should not redirect user to login page when session is invalidated', function (assert) {
      // given
      const component = createComponent('routes/campaigns/join-sco-information-modal');
      const invalidateStub = sinon.stub().resolves();
      const setStub = sinon.stub();

      class SessionStub extends Service {
        invalidate = invalidateStub;
        set = setStub;
      }

      this.owner.register('service:session', SessionStub);

      class CampaignStorageStub extends Service {
        set = sinon.stub();
      }

      this.owner.register('service:campaignStorage', CampaignStorageStub);

      const routerObserver = this.owner.lookup('service:router');
      routerObserver.replaceWith = sinon.stub();

      // when
      component.goToCampaignConnectionForm();

      // then
      sinon.assert.calledOnce(invalidateStub);
      sinon.assert.calledWith(setStub, 'skipRedirectAfterSessionInvalidation', true);
      assert.ok(true);
    });
  });
});
