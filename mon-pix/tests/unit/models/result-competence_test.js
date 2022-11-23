import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | result-competence model', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('result-competence');
    assert.ok(model);
  });

  module('#area relationship', function () {
    test('should exist', function (assert) {
      // given
      const competence = store.modelFor('result-competence');

      // when
      const relationship = competence.relationshipsByName.get('area');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(relationship.key, 'area');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(relationship.kind, 'belongsTo');
    });
  });
});
