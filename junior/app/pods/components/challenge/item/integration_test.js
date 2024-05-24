import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { setupRenderingTest } from '../../../../helpers/tests';

module('Integration | Component | challenge', function (hooks) {
  setupRenderingTest(hooks);
  test('displays embed', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: true, autoReply: true });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__embed').exists();
  });

  test('displays image', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: false, autoReply: false, illustrationUrl: 'https://pix.fr' });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__image').exists();
  });

  test('displays qroc', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: false, autoReply: false, isQROC: true, proposals: 'number' });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__qrocm').exists();
  });

  test('displays qrocm', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: false, autoReply: false, isQROCM: true, proposals: 'number' });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__qrocm').exists();
  });

  test('displays qcu', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: false, autoReply: false, isQCU: true });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__qcu').exists();
  });

  test('displays qcm', async function (assert) {
    this.set('challenge', { hasValidEmbedDocument: false, autoReply: false, isQCM: true });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__qcm').exists();
  });

  test('displays image, embed and qroc', async function (assert) {
    this.set('challenge', {
      hasValidEmbedDocument: true,
      autoReply: false,
      illustrationUrl: 'https://pix.fr',
      isQROC: true,
      proposals: 'number',
    });
    this.set('assessment', {});

    await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom('.challenge-item__image').exists();
    assert.dom('.challenge-item__embed').exists();
    assert.dom('.challenge-item__qrocm').exists();
  });

  test('displays lesson', async function (assert) {
    this.set('challenge', {
      hasValidEmbedDocument: true,
      autoReply: false,
      focused: true,
    });
    this.set('assessment', {});

    const screen = await render(hbs`<Challenge::Item @challenge={{this.challenge}} @assessment={{this.assessment}} />`);

    assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.continue') })).exists();
    assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.challenge.actions.skip') })).doesNotExist();
  });
});
