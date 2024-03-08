import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../../helpers/create-glimmer-component';

module('Unit | Component | complementary-certifications/attach-badges/target-profile-selector', function (hooks) {
  setupTest(hooks);

  module('#onSearch', function () {
    module('when there is no searchTerm', function () {
      test('it should not have attachable target profiles options yet', async function (assert) {
        const store = this.owner.lookup('service:store');
        store.query = sinon.stub();
        const component = createGlimmerComponent(
          'component:complementary-certifications/attach-badges/target-profile-selector',
        );

        // when
        component.onSearch('');

        // then
        sinon.assert.notCalled(store.query);
        assert.deepEqual(component.attachableTargetProfiles, undefined);
      });
    });

    module('when there is a searchTerm', function () {
      module('when there is a searchTerm with one number', function () {
        test('it should update attachableTargetProfiles options with the list of attachable target profile', async function (assert) {
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
          const component = createGlimmerComponent(
            'component:complementary-certifications/attach-badges/target-profile-selector',
          );
          // when
          await component.onSearch(' 1 ');

          // then
          assert.ok(store.query.calledWithExactly('attachable-target-profile', { searchTerm: '1' }));
          assert.deepEqual(component.attachableTargetProfiles, [expectedOption]);
        });
      });

      module('when there is a searchTerm with 2 or more characters', function () {
        test('it should update attachableTargetProfiles options with the list of attachable target profile', async function (assert) {
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
          const component = createGlimmerComponent(
            'component:complementary-certifications/attach-badges/target-profile-selector',
          );
          // when
          await component.onSearch('tar');

          // then
          assert.ok(store.query.calledWithExactly('attachable-target-profile', { searchTerm: 'tar' }));
          assert.deepEqual(component.attachableTargetProfiles, [expectedOption]);
        });
      });

      module('when there is a searchTerm with less than 2 characters other than number', function () {
        test('it should not trigger a search', async function (assert) {
          const store = this.owner.lookup('service:store');
          store.query = sinon.stub();
          const component = createGlimmerComponent(
            'component:complementary-certifications/attach-badges/target-profile-selector',
          );

          // when
          await component.onSearch('t');

          // then
          assert.notOk(store.query.called);
          assert.deepEqual(component.attachableTargetProfiles, undefined);
        });
      });

      module('when the search request fails', function () {
        test('it should call the onError trigger', async function (assert) {
          const store = this.owner.lookup('service:store');
          store.query = sinon.stub().rejects();
          const component = createGlimmerComponent(
            'component:complementary-certifications/attach-badges/target-profile-selector',
          );
          component.args = {
            onError: sinon.stub(),
          };

          // when
          await component.onSearch('tt');

          // then
          assert.ok(
            component.args.onError.calledWithExactly('Une erreur est survenue lors de la recherche de profils cibles.'),
          );
        });
      });
    });
  });

  module('#onSelection', function () {
    test('it should return the selected target profile', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const component = createGlimmerComponent(
        'component:complementary-certifications/attach-badges/target-profile-selector',
      );
      component.args = {
        onSelection: sinon.stub(),
      };
      const attachableTargetProfile = store.createRecord('attachable-target-profile', {
        id: 12,
        name: 'target-profile',
        badges: [{ id: 1, title: 'Dans le mille' }],
      });
      const selectedTargetProfile = {
        label: '12 - target profile',
        value: attachableTargetProfile,
      };
      store.findRecord = sinon.stub().resolves(attachableTargetProfile);

      // when
      await component.onSelection(selectedTargetProfile);

      // then
      assert.strictEqual(component.selectedTargetProfile, attachableTargetProfile);
      assert.ok(component.args.onSelection.calledWithExactly(selectedTargetProfile.value));
    });
  });

  module('#onChange', function () {
    test('it should set selectedTargetProfile to undefined, empty attachableTargetProfiles and call onChange arg', async function (assert) {
      // given
      const component = createGlimmerComponent(
        'component:complementary-certifications/attach-badges/target-profile-selector',
      );
      component.args = {
        onChange: sinon.stub(),
      };
      component.selectedTargetProfile = {
        label: '12 - target profile',
        value: { attachableTargetProfile: 'attachableTargetProfile' },
      };

      // when
      await component.onChange();

      // then
      assert.strictEqual(component.selectedTargetProfile, undefined);
      assert.deepEqual(component.attachableTargetProfiles, undefined);
      assert.ok(component.args.onChange.calledWithExactly());
    });
  });
});
