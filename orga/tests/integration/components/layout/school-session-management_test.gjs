import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import SchoolSessionManagement from 'pix-orga/components/layout/school-session-management';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Components | Layout | SchoolSessionManagement', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user can manage missions', function () {
    test('should display activate session button', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        canAccessMissionsPage = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><SchoolSessionManagement /></template>);
      // then
      assert.ok(screen.getByRole('button', { name: this.intl.t('navigation.school-sessions.activate-button') }));
    });
  });

  module('when user cannot manage missions', function () {
    test('should not display activate session button', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        canAccessMissionsPage = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><SchoolSessionManagement /></template>);
      // then
      assert.notOk(screen.queryByRole('button', { name: this.intl.t('navigation.school-sessions.activate-button') }));
    });
  });
});
