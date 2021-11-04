import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | certifications/status-select', function (hooks) {
  setupRenderingTest(hooks);

  module('when in edition mode', function () {
    module('rendering', function () {
      test('it displays a label', async function (assert) {
        // given
        const certification = EmberObject.create({ status: 'started' });
        this.set('certification', certification);

        // when
        await render(hbs`<Certifications::StatusSelect @edition={{true}} @certification={{this.certification}} />`);

        // then
        assert.contains('Statut :');
      });

      test('it displays a select list', async function (assert) {
        // given
        const certification = EmberObject.create({ status: 'started' });
        this.set('certification', certification);

        // when
        await render(hbs`<Certifications::StatusSelect @edition={{true}} @certification={{this.certification}} />`);

        // then
        assert.dom('#certification-status-selector').exists();
      });

      test('it has values', async function (assert) {
        // given
        const certification = EmberObject.create({ status: 'started' });
        this.set('certification', certification);
        const expectedOptions = [
          { value: 'started', label: 'Démarrée' },
          { value: 'error', label: 'En erreur' },
          { value: 'validated', label: 'Validée' },
          { value: 'rejected', label: 'Rejetée' },
        ];

        // when
        await render(hbs`<Certifications::StatusSelect @edition={{true}} @certification={{this.certification}} />`);

        // then
        const elementOptions = this.element.querySelectorAll('#certification-status-selector > option');
        assert.equal(elementOptions.length, 4);
        elementOptions.forEach((elementOption, index) => {
          const expectedOption = expectedOptions[index];
          assert.dom(elementOption).hasText(expectedOption.label);
          assert.dom(elementOption).hasValue(expectedOption.value);
        });
      });
    });

    module('behaviour', function () {
      test('it updates the certification status when the selected value changes', async function (assert) {
        // given
        const certification = EmberObject.create({ status: 'started' });
        this.set('certification', certification);
        await render(hbs`<Certifications::StatusSelect @edition={{true}} @certification={{this.certification}} />`);

        // when
        await fillIn('#certification-status-selector', 'validated');

        // then
        assert.equal(certification.status, 'validated');
      });
    });
  });

  module('when not in edition mode', function () {
    test('it does not render the select', async function (assert) {
      // given
      const certification = EmberObject.create({ status: 'started' });
      this.set('certification', certification);

      // when
      await render(hbs`<Certifications::StatusSelect @certification={{this.certification}} />`);

      // then
      assert.dom('#certification-status-selector').doesNotExist();
    });
  });
});
