import { module, test } from 'qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Tube::List', function (hooks) {
  setupTest(hooks);

  test('should generate a file with selected tubes', async function (assert) {
    // given
    const component = await createGlimmerComponent('component:tube/list');
    const expectedFile = JSON.stringify(['tubeId1']);

    // when
    component.tubesSelected = ['tubeId1'];

    // then
    const text = await component.file.text();
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(text, expectedFile);
  });
});
