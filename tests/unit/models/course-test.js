import { moduleForModel, test } from 'ember-qunit';

moduleForModel('course', 'Unit | Model | course', {
  needs: []
});

test('it exists', function (assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('should have a name', function (assert) {
  let model = this.subject({ name: 'My super test' });

  assert.equal(model.get('name'), 'My super test', '');
});

test('may have a description', function (assert) {
  let model = this.subject({ description: '<p>Coucou les tests</p>' });

  assert.equal(model.get('description'), '<p>Coucou les tests</p>', '');
});
