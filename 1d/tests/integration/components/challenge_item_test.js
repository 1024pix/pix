import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | challenge', function (hooks) {
  setupRenderingTest(hooks);

  test('displays embed', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: true, autoReply: true });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__embed').exists();
  });

  test('displays qroc', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: false, autoReply: false, isQROC: true, proposals: 'number' });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__qroc').exists();
  });

  test('displays qrocm', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: false, autoReply: false, isQROCM: true, proposals: 'number' });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__qrocm').exists();
  });
});
