import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | QCM proposals', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<Proposals::QcmProposals />`);
    assert.dom('.qcm-proposals').exists();
  });
});
