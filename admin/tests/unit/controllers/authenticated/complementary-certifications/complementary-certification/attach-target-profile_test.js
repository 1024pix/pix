import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | attach-target-profile', function (hooks) {
  setupTest(hooks);

  module('#onSearch', function () {
    module('when there is no searchTerm', function () {
      test('it should update options with an empty array', async function (assert) {
        const controller = this.owner.lookup(
          'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
        );

        // when
        controller.onSearch(null, '');

        // then
        assert.deepEqual(controller.options, []);
      });
    });

    module('when there is a searchTerm', function () {
      module('when there is a searchTerm with one number', function () {
        test('it should update options with the list of attachable target profile', async function (assert) {
          const store = this.owner.lookup('service:store');
          const attachableTargetProfile = store.createRecord('attachable-target-profile', {
            id: 12,
            name: 'target-profile',
          });
          const expectedOption = {
            label: '12 - target-profile',
            value: attachableTargetProfile,
          };
          store.query = sinon.stub().resolves([attachableTargetProfile]);
          const controller = this.owner.lookup(
            'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
          );
          // when
          await controller.onSearch(' 1 ');

          // then
          assert.ok(store.query.calledWithExactly('attachable-target-profile', { searchTerm: '1' }));
          assert.deepEqual(controller.options, [expectedOption]);
        });
      });

      module('when there is a searchTerm with 2 or more characters', function () {
        test('it should update options with the list of attachable target profile', async function (assert) {
          const store = this.owner.lookup('service:store');
          const attachableTargetProfile = store.createRecord('attachable-target-profile', {
            id: 12,
            name: 'target-profile',
          });
          const expectedOption = {
            label: '12 - target-profile',
            value: attachableTargetProfile,
          };
          store.query = sinon.stub().resolves([attachableTargetProfile]);
          const controller = this.owner.lookup(
            'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
          );
          // when
          await controller.onSearch('tar');

          // then
          assert.ok(store.query.calledWithExactly('attachable-target-profile', { searchTerm: 'tar' }));
          assert.deepEqual(controller.options, [expectedOption]);
        });
      });

      module('when there is a searchTerm with less than 2 characters other than number', function () {
        test('it should update searchResults with the list of attachable target profile', async function (assert) {
          const store = this.owner.lookup('service:store');
          const controller = this.owner.lookup(
            'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
          );
          store.query = sinon.stub();

          // when
          await controller.onSearch('t');

          // then
          assert.notOk(store.query.called);
          assert.deepEqual(controller.options, []);
        });
      });
    });
  });

  module('#onSelection', function () {
    test('it should update reset options, set the selectedTargetProfile and fetch the badges', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const controller = this.owner.lookup(
        'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
      );
      const attachableTargetProfile = store.createRecord('attachable-target-profile', {
        id: 12,
        name: 'target-profile',
        badges: [
          {id: 1, title: 'Dans le mille'}
        ]
      });
      const targetProfileSelected = {
        label: '12 - target profile',
        value: attachableTargetProfile,
      };
      store.findRecord = sinon.stub().resolves(attachableTargetProfile);

      // when
      await controller.onSelection(targetProfileSelected);

      // then
      assert.deepEqual(controller.options, []);
      assert.deepEqual(controller.selectedTargetProfile, attachableTargetProfile);
      assert.deepEqual(controller.targetProfileBadges, [{
        id: 1,
        label: 'Dans le mille',
      }]);
    });
  });

  module('#onChange', function () {
    test('it should reset the selectedTargetProfile', async function (assert) {
      // given
      const controller = this.owner.lookup(
        'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
      );

      // when
      controller.onChange();

      // then
      assert.strictEqual(controller.selectedTargetProfile, undefined);
    });
  });
});
