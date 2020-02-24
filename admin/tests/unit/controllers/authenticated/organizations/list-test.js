import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/organizations/list', function(hooks) {
  setupTest(hooks);

  module('#setFieldName', function() {

    test('it should set name', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/organizations/list');
      controller.set('searchFilter', { fieldName: 'name', value: 'sav' });

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('name'), 'sav');
    });

    test('it should set type', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/organizations/list');
      controller.set('searchFilter', { fieldName: 'type', value: 'SCO' });

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('type'), 'SCO');
    });

    test('it should set code', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/organizations/list');
      controller.set('searchFilter', { fieldName: 'code', value: 'ABC001' });

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('code'), 'ABC001');
    });

    test('it should reset pageNumber', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/organizations/list');
      controller.set('searchFilter', { fieldName: 'name', value: 'random thing' });
      controller.set('pageNumber', 3);

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('pageNumber'), 1);
    });
  });
});
