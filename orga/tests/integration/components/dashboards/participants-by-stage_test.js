import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Charts::ParticipantsByStage', function(hooks) {
  setupIntlRenderingTest(hooks);
  let onSelectStage;

  module('For one stage', (hooks) => {
    hooks.beforeEach(async function() {
      // given
      onSelectStage = sinon.stub();
      this.set('onSelectStage', onSelectStage);
      this.set('maxStage', 3);
      this.set('data', [{ id: 100498, stage: 1, value: 5, title: 'title', description: 'description' }]);

      // when
      await render(hbs`<Charts::ParticipantsByStage @data={{data}} @maxStage={{maxStage}} @onSelectStage={{onSelectStage}} />`);
    });

    test('it should display stage stars', async function(assert) {
      // then
      assert.dom('[data-test-status=unacquired]').isVisible({ count: 2 });
      assert.dom('[data-test-status=acquired]').isVisible({ count: 1 });
    });

    test('it should display participants number', async function(assert) {
      // then
      assert.contains('5 participants');
    });

    test('it should display participants percentage by stages', async function(assert) {
      // then
      assert.contains('100 %');
    });

    test('it should contains tooltip info in dom', async function(assert) {
      // then
      assert.contains('title');
      assert.contains('description');
    });

    test('it should call onSelectStage when user click on a bar', async function(assert) {
      // when
      await click('[role=button]');
      // then
      assert.dom('[role=button]').exists();
      sinon.assert.calledWith(onSelectStage, 100498);
    });
  });

  module('For several stages', (hooks) => {
    hooks.beforeEach(async function() {
      // given
      this.set('maxStage', 2);
      this.set('data', [
        { id: 100498, stage: 0, value: 5, title: 'title', description: 'description' },
        { id: 100499, stage: 1, value: 10, title: 'title', description: 'description' },
      ]);

      // when
      await render(hbs`<Charts::ParticipantsByStage @data={{data}} @maxStage={{maxStage}} />`);
    });

    test('it should display data for each stage', async function(assert) {
      // then
      assert.contains('5 participants');
      assert.contains('10 participants');
      assert.contains('33 %');
      assert.contains('67 %');
    });
  });
});
