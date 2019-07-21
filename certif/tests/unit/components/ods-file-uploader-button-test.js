import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | ods-file-uploader-button', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const component = this.owner.lookup('component:ods-file-uploader-button');
    assert.ok(component);
  });
});
