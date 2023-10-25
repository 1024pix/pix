import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sup-organization-participants/list', function (hooks) {
  setupTest(hooks);
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
    test('calls adapter deleteParticipants method', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentUser = this.owner.lookup('service:currentUser');
      const adapter = store.adapterFor('sup-organization-participant');
      sinon.stub(adapter, 'deleteParticipants');
      controller.send = sinon.stub();

      const learner1 = { id: 1 };
      const learner2 = { id: 2 };
      const organizationId = 3;
      currentUser.organization = {
        id: organizationId,
      };

      // when
      await controller.deleteStudents([learner1, learner2]);

      // then
      assert.ok(adapter.deleteParticipants.calledWith(organizationId, [learner1.id, learner2.id]));
      assert.ok(controller.send.calledWith('refreshModel'));
    });
  });
});
