import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { findAll } from '@ember/test-helpers';
import ModulixAudioElement from 'mon-pix/components/module/element/audio';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Audio', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an audio', async function (assert) {
    // given
    const url = 'https://assets.pix.fr/modulix/placeholder-audio.mp3';

    const audioElement = {
      url,
      title: 'title',
      transcription: '',
    };

    //  when
    const screen = await render(<template><ModulixAudioElement @audio={{audioElement}} /></template>);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-audio').length, 1);
    assert.ok(document.getElementsByClassName('pix-audio-player'));
  });

});
