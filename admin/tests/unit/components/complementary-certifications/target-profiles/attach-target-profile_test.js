import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('Unit | Component | attach-target-profile', function (hooks) {
  setupTest(hooks);

  module('#selectedTargetProfileValue', function () {
    module('when a value has been selected', function () {
      test('it should return selected target profile value', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const component = createGlimmerComponent(
          'component:complementary-certifications/target-profiles/attach-target-profile',
        );
        component.selectedTargetProfile = store.createRecord('attachable-target-profile', {
          id: 12,
          name: 'target-profile',
        });

        // when then
        assert.strictEqual(component.selectedTargetProfileValue, '12 - target-profile');
      });
    });

    module('when there is no value to select', function () {
      test('it should return an empty string', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const component = createGlimmerComponent(
          'component:complementary-certifications/target-profiles/attach-target-profile',
        );
        component.selectedTargetProfile = store.createRecord('attachable-target-profile', '');

        // when then
        assert.strictEqual(component.selectedTargetProfileValue, '');
      });
    });
  });

  module('#onSearchValueInput', function () {
    module('when there is no searchTerm', function () {
      test('it should update searchResults with an empty array', async function (assert) {
        const component = createGlimmerComponent(
          'component:complementary-certifications/target-profiles/attach-target-profile',
        );
        // when
        component.onSearchValueInput(null, '');

        // then
        assert.deepEqual(component.searchResults, []);
      });
    });

    module('when there is a searchTerm', function () {
      module('when there is a searchTerm with one number', function () {
        test('it should update searchResults with the list of attachable target profile', async function (assert) {
          const store = this.owner.lookup('service:store');
          const attachableTargetProfile = store.createRecord('attachable-target-profile', {
            id: 12,
            name: 'target-profile',
          });
          store.query = sinon.stub().resolves([attachableTargetProfile]);
          const component = createGlimmerComponent(
            'component:complementary-certifications/target-profiles/attach-target-profile',
          );
          // when
          await component.onSearchValueInput(null, ' 1 ');

          // then
          assert.ok(store.query.calledWithExactly('attachable-target-profile', { searchTerm: '1' }));
          assert.deepEqual(component.searchResults, [attachableTargetProfile]);
        });
      });
      module('when there is a searchTerm with 2 or more characters', function () {
        test('it should update searchResults with the list of attachable target profile', async function (assert) {
          const store = this.owner.lookup('service:store');
          const attachableTargetProfile = store.createRecord('attachable-target-profile', {
            id: 12,
            name: 'target-profile',
          });
          store.query = sinon.stub().resolves([attachableTargetProfile]);
          const component = createGlimmerComponent(
            'component:complementary-certifications/target-profiles/attach-target-profile',
          );
          // when
          await component.onSearchValueInput(null, 'tar');

          // then
          assert.ok(store.query.calledWithExactly('attachable-target-profile', { searchTerm: 'tar' }));
          assert.deepEqual(component.searchResults, [attachableTargetProfile]);
        });
      });
      module('when there is a searchTerm with less than 2 characters other than number', function () {
        test('it should update searchResults with the list of attachable target profile', async function (assert) {
          const store = this.owner.lookup('service:store');
          const component = createGlimmerComponent(
            'component:complementary-certifications/target-profiles/attach-target-profile',
          );
          store.query = sinon.stub();

          // when
          await component.onSearchValueInput(null, 't');

          // then
          assert.notOk(store.query.called);
          assert.deepEqual(component.searchResults, []);
        });
      });
    });
  });
});
