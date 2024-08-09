import { render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import ModuleElementDownload from 'mon-pix/components/module/element/download';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Element | Download', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a Download', async function (assert) {
    // given
    const downloadElement = { files: [{ url: 'https://example.org/image.jpg', format: '.jpg' }], type: 'download' };

    //  when
    const screen = await render(<template><ModuleElementDownload @download={{downloadElement}} /></template>);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-download').length, 1);
  });
});
