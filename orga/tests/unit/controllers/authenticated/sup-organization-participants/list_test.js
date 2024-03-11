import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../../../helpers/setup-intl';

module('Unit | Controller | authenticated/sup-organization-participants/list', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sup-organization-participants/list');
  });

  module('#triggerFiltering', function () {
    module('when the filters contain a valued field', function () {
      test('updates the value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', 'new-value');

        // then
        assert.strictEqual(controller.someField, 'new-value');
      });
    });

    module('when the filters contain an empty string', function () {
      test('clear the searched value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', '');

        // then
        assert.strictEqual(controller.someField, undefined);
      });
    });
  });

  module('#onResetFilter', function () {
    test('resets every filters', async function (assert) {
      // given
      controller.search = 'th';
      controller.groups = ['ing'];
      controller.studentNumber = 'co';
      controller.certificability = ['ool'];
      controller.pageNumber = 1;
      controller.pageSize = 10;

      // when
      controller.onResetFilter();

      // then
      assert.strictEqual(controller.search, null);
      assert.deepEqual(controller.groups, []);
      assert.strictEqual(controller.studentNumber, null);
      assert.deepEqual(controller.certificability, []);
      assert.strictEqual(controller.pageNumber, null);
      assert.strictEqual(controller.pageSize, 10);
    });
  });

  module('#deleteStudents', function () {
    test('it deletes participants', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentUser = this.owner.lookup('service:currentUser');
      const adapter = store.adapterFor('sup-organization-participant');
      sinon.stub(adapter, 'deleteParticipants');
      controller.send = sinon.stub();
      controller.notifications = { sendSuccess: sinon.stub(), sendError: sinon.stub() };

      const learner1 = { id: 1 };
      const learner2 = { id: 2 };
      const organizationId = 3;
      currentUser.organization = {
        id: organizationId,
      };
      const listLearners = [learner1, learner2];

      // when
      await controller.deleteStudents(listLearners);

      // then
      assert.ok(adapter.deleteParticipants.calledWith(organizationId, [learner1.id, learner2.id]));
      assert.ok(controller.send.calledWith('refreshModel'));
      assert.true(
        controller.notifications.sendSuccess.calledWith(
          this.intl.t('pages.sup-organization-participants.action-bar.success-message', {
            count: listLearners.length,
            firstname: listLearners[0].firstName,
            lastname: listLearners[0].lastName,
          }),
        ),
      );
      assert.true(controller.notifications.sendError.notCalled);
    });

    test('it cannot delete participants', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentUser = this.owner.lookup('service:currentUser');
      const adapter = store.adapterFor('sup-organization-participant');
      sinon.stub(adapter, 'deleteParticipants');
      adapter.deleteParticipants.rejects();
      controller.send = sinon.stub();
      controller.notifications = { sendSuccess: sinon.stub(), sendError: sinon.stub() };

      const learner1 = { id: 1 };
      const learner2 = { id: 2 };
      const organizationId = 3;
      currentUser.organization = {
        id: organizationId,
      };
      const listLearners = [learner1, learner2];

      // when
      await controller.deleteStudents(listLearners);

      // then
      assert.ok(adapter.deleteParticipants.calledWith(organizationId, [learner1.id, learner2.id]));
      assert.notOk(controller.send.calledWith('refreshModel'));
      assert.true(controller.notifications.sendSuccess.notCalled);
      assert.true(
        controller.notifications.sendError.calledWith(
          this.intl.t('pages.sup-organization-participants.action-bar.error-message', {
            count: listLearners.length,
            firstname: listLearners[0].firstName,
            lastname: listLearners[0].lastName,
          }),
        ),
      );
    });
  });

  module('#sortByLastname', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.lastnameSort = null;
      controller.participationCountOrder = 'Godzilla';
      controller.pageNumber = 9999;
      // when
      controller.sortByLastname('desc');

      // then
      assert.strictEqual(controller.lastnameSort, 'desc');
      assert.strictEqual(controller.participationCountOrder, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });

  module('#sortByParticipationCount', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.participationCountOrder = null;
      controller.lastnameSort = 'T-Rex';
      controller.pageNumber = 9999;
      // when
      controller.sortByParticipationCount('desc');

      // then
      assert.strictEqual(controller.participationCountOrder, 'desc');
      assert.strictEqual(controller.lastnameSort, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });
});
