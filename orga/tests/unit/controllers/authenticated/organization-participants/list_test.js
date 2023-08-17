import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/organization-participants', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#triggerFiltering', function () {
    module('when the filters contain the field fullName', function () {
      test('updates the fullName value', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/organization-participants/list');

        controller.fullName = 'old-value';

        // when
        controller.triggerFiltering('fullName', 'new-value');

        // then
        assert.strictEqual(controller.fullName, 'new-value');
      });
    });

    module('when the filters contain an empty for fullName', function () {
      test('clear the searched value', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/organization-participants/list');

        controller.fullName = 'old-value';

        // when
        controller.triggerFiltering('fullName', '');

        // then
        assert.strictEqual(controller.fullName, undefined);
      });
    });
  });

  module('#resetFilters', function () {
    test('it resets all filters', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/organization-participants/list');

      controller.fullName = 'value';
      controller.pageNumber = 2;

      // when
      controller.resetFilters();

      // then
      assert.strictEqual(controller.fullName, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });

  module('#deleteOrganizationLearners', function (hooks) {
    let controller;
    let deleteParticipants;
    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('organization-participant');
      deleteParticipants = sinon.stub(adapter, 'deleteParticipants');
      controller = this.owner.lookup('controller:authenticated/organization-participants/list');
      controller.notifications = { sendSuccess: sinon.stub(), sendError: sinon.stub() };
      controller.send = sinon.stub();
      controller.currentUser = { organization: { id: 1 } };
    });

    test('success case', async function (assert) {
      //given
      const listLearners = [{ id: 1, firstName: 'Red', lastName: 'Bull' }];
      deleteParticipants.resolves();

      // when
      await controller.deleteOrganizationLearners(listLearners);

      //then
      assert.true(deleteParticipants.calledWith(1, [1]));
      assert.true(controller.send.calledWith('refreshModel'));
      assert.true(
        controller.notifications.sendSuccess.calledWith(
          this.intl.t('pages.organization-participants.action-bar.success-message', {
            count: listLearners.length,
            firstname: listLearners[0].firstName,
            lastname: listLearners[0].lastName,
          }),
        ),
      );
      assert.true(controller.notifications.sendError.notCalled);
    });

    test('failed case', async function (assert) {
      //given
      const listLearners = [{ id: 1, firstName: 'Red', lastName: 'Bull' }];
      deleteParticipants.rejects();

      // when
      await controller.deleteOrganizationLearners(listLearners);

      //then
      assert.true(deleteParticipants.calledWith(1, [1]));
      assert.true(controller.send.notCalled);
      assert.true(controller.notifications.sendSuccess.notCalled);
      assert.true(
        controller.notifications.sendError.calledWith(
          this.intl.t('pages.organization-participants.action-bar.error-message', {
            count: listLearners.length,
            firstname: listLearners[0].firstName,
            lastname: listLearners[0].lastName,
          }),
        ),
      );
    });
  });
});
