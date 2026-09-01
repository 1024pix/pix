import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/sco-organization-participants/list', function (hooks) {
  setupTest(hooks);
  const currentUser = { organization: { id: 1 } };
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sco-organization-participants/list');
    controller.send = sinon.stub();
    controller.currentUser = currentUser;
  });

  module('#resetFiltering', function () {
    test('resets every filters', async function (assert) {
      // given
      controller.search = 'th';
      controller.divisions = ['ing'];
      controller.connectionTypes = 'co';
      controller.certificability = ['ool'];
      controller.pageNumber = 1;
      controller.pageSize = 10;

      // when
      controller.resetFiltering();

      // then
      assert.strictEqual(controller.search, null);
      assert.deepEqual(controller.divisions, []);
      assert.deepEqual(controller.connectionTypes, []);
      assert.deepEqual(controller.certificability, []);
      assert.strictEqual(controller.pageNumber, null);
      assert.strictEqual(controller.pageSize, 10);
    });
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

  module('#sortByDivision', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.divisionSort = null;
      controller.participationCountOrder = 'Godzilla';
      controller.lastnameSort = 'Kong';
      controller.pageNumber = 9999;
      controller.latestParticipationSort = 'asc';

      // when
      controller.sortByDivision();

      // then
      assert.strictEqual(controller.divisionSort, 'asc');
      assert.strictEqual(controller.participationCountOrder, null);
      assert.strictEqual(controller.lastnameSort, null);
      assert.strictEqual(controller.pageNumber, null);
      assert.strictEqual(controller.latestParticipationSort, null);
    });
  });

  module('#sortByLastname', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.lastnameSort = null;
      controller.divisionSort = 'king';
      controller.participationCountOrder = 'Godzilla';
      controller.pageNumber = 9999;
      controller.latestParticipationSort = 'asc';

      // when
      controller.sortByLastname();

      // then
      assert.strictEqual(controller.lastnameSort, 'asc');
      assert.strictEqual(controller.divisionSort, null);
      assert.strictEqual(controller.participationCountOrder, null);
      assert.strictEqual(controller.pageNumber, null);
      assert.strictEqual(controller.latestParticipationSort, null);
    });
  });

  module('#sortByParticipationCount', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.participationCountOrder = 'asc';
      controller.divisionSort = 'king';
      controller.lastnameSort = 'asc';
      controller.pageNumber = 9999;
      controller.latestParticipationSort = 'asc';

      // when
      controller.sortByParticipationCount();

      // then
      assert.strictEqual(controller.participationCountOrder, 'desc');
      assert.strictEqual(controller.lastnameSort, null);
      assert.strictEqual(controller.divisionSort, null);
      assert.strictEqual(controller.pageNumber, null);
      assert.strictEqual(controller.latestParticipationSort, null);
    });
  });

  module('#sortByLatestParticipation', function () {
    test('update sorting value and reset other', function (assert) {
      // given
      controller.latestParticipationSort = null;
      controller.participationCountOrder = 'asc';
      controller.divisionSort = 'king';
      controller.lastnameSort = 'asc';
      controller.pageNumber = 9999;

      // when
      controller.sortByLatestParticipation();

      // then
      assert.strictEqual(controller.latestParticipationSort, 'asc');
      assert.strictEqual(controller.participationCountOrder, null);
      assert.strictEqual(controller.lastnameSort, null);
      assert.strictEqual(controller.divisionSort, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });
});
