import { moduleForModel, test } from 'ember-qunit';

moduleForModel('assessment', 'Unit | Model | assessment', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject({name: 'Hello', description: 'Descr'}); // FIXME: use factories
  // let store = this.store();
  assert.ok(!!model);

  assert.ok(!!model.get('name'));
  assert.ok(!!model.get('description'));
});
