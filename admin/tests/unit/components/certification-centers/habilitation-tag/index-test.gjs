import { setupTest } from 'ember-qunit';
// import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | certification-centers/habilitation-tag', function (hooks) {
  setupTest(hooks);

  test('it should return the correct icon and classname when the center is habilited', function (assert) {
    const component = createGlimmerComponent('component:certification-centers/habilitation-tag', {
      active: true,
    });
    assert.strictEqual(component.className, 'habilitation-icon habilitation-icon--granted');
    assert.strictEqual(component.icon, 'checkCircle');
  });

  test('it should return the correct icon and classname when the center is NOT habilited', function (assert) {
    const component = createGlimmerComponent('component:certification-centers/habilitation-tag', {
      active: false,
    });

    assert.strictEqual(component.className, 'habilitation-icon habilitation-icon--non-granted');
    assert.strictEqual(component.icon, 'cancel');
  });
});
