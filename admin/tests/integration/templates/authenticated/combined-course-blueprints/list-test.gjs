import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseBlueprintList from 'pix-admin/templates/authenticated/combined-course-blueprints/list';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | combined-course-blueprints | list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render combined course list component', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };

    // when
    const screen = await render(<template><CombinedCourseBlueprintList /></template>);

    // then
    assert.ok(screen.getByRole('heading', { level: 1, name: t('components.combined-course-blueprints.list.title') }));
    assert.ok(screen.getByRole('link', { name: t('components.combined-course-blueprints.create.title') }));
  });

  test('it should not display create button when user is not super admin', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: false };

    // when
    const screen = await render(<template><CombinedCourseBlueprintList /></template>);

    // then
    assert.ok(screen.getByRole('heading', { level: 1, name: t('components.combined-course-blueprints.list.title') }));
    assert
      .dom(screen.queryByRole('link', { name: t('components.combined-course-blueprints.create.title') }))
      .doesNotExist();
  });
});
