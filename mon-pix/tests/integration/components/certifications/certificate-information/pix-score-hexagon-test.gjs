import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PixScoreHexagon from 'mon-pix/components/certifications/certificate-information/pix-score-hexagon';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certificate information | pix score hexagon', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the certified pix score', async function (assert) {
    // when
    const screen = await render(<template><PixScoreHexagon @pixScore={{654}} /></template>);

    // then
    assert.dom(screen.getByText('654')).exists();
    assert.dom(screen.getByText(t('common.pix'))).exists();
    assert.dom(screen.getByText(t('pages.certificate.hexagon-score.certified'))).exists();
  });
});
