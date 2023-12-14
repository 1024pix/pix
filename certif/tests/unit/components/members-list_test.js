import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import createGlimmerComponent from '../../helpers/create-glimmer-component';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Component | MembersList', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks);

  let component, store;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:members-list');
    store = this.owner.lookup('service:store');
  });

  module('Getters', function () {
    module('#isMultipleAdminsAvailable', () => {
      module('when there is multiple members with the role "ADMIN"', function () {
        test('returns true', function (assert) {
          // given
          component.args.members = [
            store.createRecord('member', {
              id: 1,
              firstName: 'Éva',
              lastName: 'Kué',
              role: 'ADMIN',
            }),
            store.createRecord('member', {
              id: 2,
              firstName: 'Matt',
              lastName: 'Ematic',
              role: 'ADMIN',
            }),
            store.createRecord('member', {
              id: 3,
              firstName: 'Harry',
              lastName: 'Coe',
              role: 'MEMBER',
            }),
          ];

          // when
          // then
          assert.true(component.isMultipleAdminsAvailable);
        });
      });

      module('when there is one member with the role "ADMIN"', function () {
        test('returns false', function (assert) {
          // given
          component.args.members = [
            store.createRecord('member', {
              id: 1,
              firstName: 'Jean',
              lastName: 'Tourloupe',
              role: 'ADMIN',
            }),
            store.createRecord('member', {
              id: 2,
              firstName: 'Éva',
              lastName: 'Noui',
              role: 'MEMBER',
            }),
          ];

          // when
          // then
          assert.false(component.isMultipleAdminsAvailable);
        });
      });
    });
  });
});
