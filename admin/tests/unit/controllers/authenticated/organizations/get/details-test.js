import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl, { t } from '../../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/organizations/get/details', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#updateOrganizationInformation', function () {
    module('when there is no error', function () {
      test('displays a success notification', async function (assert) {
        // Given
        const controller = this.owner.lookup('controller:authenticated.organizations.get.details');
        controller.router = { transitionTo: sinon.stub() };
        controller.model = {
          id: 3,
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        };
        controller.pixToast = {
          sendSuccessNotification: sinon.stub(),
        };
        controller.model.save.resolves();

        // When
        await controller.updateOrganizationInformation();

        // Then
        sinon.assert.calledOnce(controller.model.save);
        sinon.assert.calledWith(controller.pixToast.sendSuccessNotification, {
          message: t('components.organizations.information-section-view.update.notifications.success'),
        });
        assert.ok(true);
      });
    });

    module('when there is an error', function () {
      test('displays an error notification', async function (assert) {
        // Given
        const controller = this.owner.lookup('controller:authenticated.organizations.get.details');
        controller.model = {
          id: 3,
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        };
        controller.pixToast = {
          sendErrorNotification: sinon.stub(),
        };
        controller.model.save.rejects();

        // When
        await controller.updateOrganizationInformation();

        // Then
        sinon.assert.calledOnce(controller.model.save);
        sinon.assert.calledOnce(controller.model.rollbackAttributes);
        sinon.assert.calledWith(controller.pixToast.sendErrorNotification, {
          message: t('common.notifications.generic-error'),
        });
        assert.ok(true);
      });
    });
  });

  module('#archiveOrganization', function () {
    test('it should update organization and redirect to get route', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated.organizations.get.details');
      controller.router = { transitionTo: sinon.stub() };
      controller.model = {
        id: 3,
        save: sinon.stub(),
      };
      controller.pixToast = {
        sendSuccessNotification: sinon.stub(),
      };
      controller.model.save.resolves();

      // when
      await controller.archiveOrganization();

      // then
      assert.ok(controller.model.save.called);
      assert.true(controller.router.transitionTo.calledWith('authenticated.organizations.get'));
    });
  });
});
