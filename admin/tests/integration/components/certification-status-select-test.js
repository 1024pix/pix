import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import XSelectInteractor from 'emberx-select/test-support/interactor';
import EmberObject from '@ember/object';

module('Integration | Component | certification-status-select', function(hooks) {

  const xselect = new XSelectInteractor('.certification-status-select select');

  setupRenderingTest(hooks);

  module('when in edition mode', function() {

    module('rendering', function() {

      test('it renders the select', async function(assert) {
        // when
        await render(hbs`<CertificationStatusSelect @edition={{true}} />`);

        // then
        assert.dom('.certification-status-select select').exists();
      });

      test('it has a label', async function(assert) {
        // when
        await render(hbs`{{certification-status-select edition=true}}`);

        // then
        assert.dom('.certification-status-select label').hasText('Statut :');
      });

      test('it has values', async function(assert) {
        // given
        const expectedValues = ['started', 'error', 'validated', 'rejected'];

        // when
        await render(hbs`{{certification-status-select edition=true}}`);

        // then
        assert.deepEqual(xselect.options().map((option) => option.value), expectedValues);
      });
    });

    module('behaviour', function() {

      test('it updates the certification status when the selected value changes', async function(assert) {
        // given
        const certification = EmberObject.create({ status: 'started' });
        this.set('certification', certification);
        await render(hbs`<CertificationStatusSelect @edition={{true}} @value={{certification.status}} />`);

        // when
        await xselect.select('validated');

        // then
        assert.equal(certification.status, 'validated');
      });
    });
  });

  module('when not in edition mode', function() {

    test('it does not render the select', async function(assert) {
      // when
      await render(hbs`{{certification-status-select}}`);

      // then
      assert.dom('.certification-status-select select').doesNotExist();
    });
  });
});
