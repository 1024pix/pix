import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/users/list', function(hooks) {
  setupTest(hooks);

  module('#setFieldName', function() {

    test('it should set firstName', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/users/list');
      controller.set('searchFilter', { fieldName: 'firstName', value: 'Emilie' });

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('firstName'), 'Emilie');
    });

    test('it should set lastName', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/users/list');
      controller.set('searchFilter', { fieldName: 'lastName', value: 'Duval' });

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('lastName'), 'Duval');
    });

    test('it should set email', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/users/list');
      controller.set('searchFilter', { fieldName: 'email', value: 'emilie.duval' });

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('email'), 'emilie.duval');
    });

    test('it should reset pageNumber', function(assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/users/list');
      controller.set('searchFilter', { fieldName: 'firstName', value: 'random name' });
      controller.set('pageNumber', 3);

      // when
      controller.setFieldName();

      // then
      assert.equal(controller.get('pageNumber'), 1);
    });
  });
});
