import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CreateCombinedCourseBlueprint from 'pix-admin/templates/authenticated/combined-course-blueprints/create';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | combined-course-blueprints | Create', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render combined course form component', async function (assert) {
    // when
    const screen = await render(<template><CreateCombinedCourseBlueprint /></template>);

    // then
    assert.ok(screen.getByRole('heading', { level: 1, name: t('components.combined-courses.create-form.title') }));
  });
});
