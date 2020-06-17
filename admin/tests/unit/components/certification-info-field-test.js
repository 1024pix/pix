import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | certification-info-field', function(hooks) {
  setupTest(hooks);

  test('it should compute correct widths for large dimensions', function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-info-field').create();
    assert.expect(2);

    // when
    component.set('large', false);

    //then
    assert.equal(component.get('leftWidth').toString(), 'col-sm-5');
    assert.equal(component.get('rightWidth').toString(), 'col-sm-7');
  });

  test('it should compute correct widths for small dimensions', function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-info-field').create();
    assert.expect(2);

    // when
    component.set('large', true);

    //then
    assert.equal(component.get('leftWidth').toString(), 'col-sm-3');
    assert.equal(component.get('rightWidth').toString(), 'col-sm-9');
  });
});
