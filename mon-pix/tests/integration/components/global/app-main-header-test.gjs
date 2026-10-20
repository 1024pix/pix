import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import AppMainHeader from 'mon-pix/components/global/app-main-header';
import { module, test } from 'qunit';

import { stubCurrentUserService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Global | App Main Header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user profile is loaded', function () {
    test('it displays the user Pix score', async function (assert) {
      // given
      stubCurrentUserService(
        this.owner,
        { id: 1, firstName: 'Banana', lastName: 'Split', profile: { pixScore: 42 } },
        { withStoreStubbed: false },
      );

      // when
      const screen = await render(<template><AppMainHeader /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: /^42\sPix$/ })).exists();
    });
  });

  module('when user profile is not loaded', function () {
    test('it displays the header', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { id: 1, firstName: 'Banana', lastName: 'Split' });

      // when
      const screen = await render(<template><AppMainHeader /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: t('navigation.main.code') })).exists();
    });
  });
});
