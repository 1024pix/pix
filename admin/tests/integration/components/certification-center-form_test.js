import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Integration | Component | certification-center-form', function(hooks) {

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.onSubmit = () => {};
    this.onCancel = () => {};
    this.certificationCenter = EmberObject.create();
  });

  test('it renders the new certification center form component', async function(assert) {
    // when
    await render(hbs`<CertificationCenterForm @certificationCenter={{this.certificationCenter}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`);

    // then
    assert.contains('Nom :');
    assert.contains('Type :');
    assert.contains('Identifiant externe :');
    assert.contains('Annuler');
    assert.contains('Ajouter');
  });

  module('#selectCertificationCenterType', function() {

    test('should update attribute certificationCenter.type', async function(assert) {
      // given
      await render(hbs`<CertificationCenterForm @certificationCenter={{this.certificationCenter}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`);

      // when
      await selectChoose('#certificationCenterTypeSelector', 'Établissement scolaire');

      // then
      assert.equal(this.certificationCenter.type, 'SCO');
      assert.dom('.ember-power-select-selected-item').hasText('Établissement scolaire');
    });
  });
});
