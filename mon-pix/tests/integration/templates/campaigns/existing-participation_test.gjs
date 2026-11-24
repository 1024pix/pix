import { render } from '@1024pix/ember-testing-library';
import ExistingParticipation from 'mon-pix/templates/campaigns/existing-participation';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Template | existing participation', function (hooks) {
  setupIntlRenderingTest(hooks);
  const model = {
    firstName: 'John',
    lastName: 'Doe',
  };

  module('display existing participation page', function () {
    test('it should display error page', async function (assert) {
      // given
      const screen = await render(<template><ExistingParticipation @model={{model}} /></template>);

      // then
      assert.ok(screen.getByRole('heading', { name: t('pages.campaign.errors.existing-participation') }));
      assert.ok(
        screen.getByText(
          t('pages.campaign.errors.existing-participation-user-info', {
            firstName: model.firstName,
            lastName: model.lastName,
          }),
        ),
      );
      assert.ok(screen.getByText(t('pages.campaign.errors.existing-participation-info')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-profile') }));
    });
  });
});
