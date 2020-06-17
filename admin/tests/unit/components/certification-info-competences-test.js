import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | certification-info-competences', function(hooks) {
  setupTest(hooks);

  test('it computes indexed values correctly', function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-info-competences').create();

    // when
    component.set('competences', [{ 'index':'1.1', value:'a competence', score:16, level:2 }, { 'index':'3.3', value:'another competence', score:42, level:5 }, { 'index':'5.2', value:'and another competence', score:37, level:4 }]);

    // then
    assert.deepEqual(component.get('indexedValues'), { 'scores':[16, null, null, null, null, null, null, null, null, 42, null, null, null, null, null, 37], 'levels':[2, null, null, null, null, null, null, null, null, 5, null, null, null, null, null, 4] });
  });

});
