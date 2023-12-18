import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click, findAll } from '@ember/test-helpers';

module.only('Integration | Component | Module | Video', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a video', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const url = 'https://videos.pix.fr/modulix/chat_animation_2.webm';

    const videoElement = store.createRecord('video', {
      url,
      title: 'title',
      subtitles: 'subtitles',
      alternativeText: 'alternative instruction',
    });

    this.set('video', videoElement);

    //  when
    const screen = await render(hbs`<Module::Video @video={{this.video}}/>`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-video').length, 1);
    assert.ok(screen.getByRole('video', { name: 'alternative instruction' }).hasAttribute(url));
    assert.ok(screen.getByRole('button', { name: 'Afficher la transcription' }));
  });

  test('should be able to use the modal for alternative instruction', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const alternativeText = 'alternative text of video';
    const url = 'https://videos.pix.fr/modulix/chat_animation_2.webm';

    const videoElement = store.createRecord('video', {
      url,
      title: 'title',
      subtitles: 'subtitles',
      alternativeText: alternativeText,
    });

    this.set('video', videoElement);

    //  when
    const screen = await render(hbs`<Module::Video @video={{this.video}}/>`);

    // then
    await click(screen.getByRole('button', { name: 'Afficher la transcription' }));
    assert.strictEqual(findAll('.element__video-modal').length, 1);
    assert.ok(screen.getByText('subtitles'));
  });
});
