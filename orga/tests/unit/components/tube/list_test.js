import { module, test } from 'qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Tube::List', function (hooks) {
  setupTest(hooks);

  test('should generate a file with selected tubes', async function (assert) {
    // given
    const component = await createGlimmerComponent('component:tube/list');
    const expectedFile = JSON.stringify(['tubeId1']);
    component.selectedTubeIds = ['tubeId1'];

    // when
    const text = await component.file.text();

    // then
    assert.strictEqual(text, expectedFile);
  });
});
