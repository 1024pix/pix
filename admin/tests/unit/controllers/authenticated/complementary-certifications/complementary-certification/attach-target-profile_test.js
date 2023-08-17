import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
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
            value: '12',
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
            value: '12',
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

  module('#onSelectTargetProfile', function () {
    module('when a target profile is selected', function () {
      test('it should update selectedTargetProfile and searchResults with an empty array', async function (assert) {
        const store = this.owner.lookup('service:store');
        const controller = this.owner.lookup(
          'controller:authenticated/complementary-certifications.complementary-certification.attach-target-profile',
        );
        const targetProfile = store.createRecord('attachable-target-profile', {
          id: 12,
          name: 'target profile',
        });

        // when
        controller.onSelection(targetProfile);

        // then
        assert.deepEqual(controller.options, []);
      });
    });
  });
});
