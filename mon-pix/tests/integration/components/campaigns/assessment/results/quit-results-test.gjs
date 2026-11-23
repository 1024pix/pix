import { render } from '@1024pix/ember-testing-library';
import QuitResults from 'mon-pix/components/campaigns/assessment/results/quit-results';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import { stubCurrentUserService } from '../../../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Results | Quit Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    stubCurrentUserService(this.owner, { firstName: 'Alain', isAnonymous: false });
  });

  test('it should display a quit button link', async function (assert) {
    // when
    const screen = await render(<template><QuitResults /></template>);

    // then
    assert.ok(
      screen
        .getByRole('link', {
          name: t('pages.skill-review.actions.back-to-pix'),
        })
        .getAttribute('href')
        .includes('/'),
    );
  });
});
