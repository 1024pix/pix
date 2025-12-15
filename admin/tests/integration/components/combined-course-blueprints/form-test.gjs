import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseBlueprintForm from 'pix-admin/components/combined-course-blueprints/form';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | CombinedCourseBlueprints::form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render combined course form component', async function (assert) {
    // when
    const screen = await render(<template><CombinedCourseBlueprintForm /></template>);

    // then
    assert.ok(screen.getByRole('heading', { level: 1, name: t('components.combined-courses.create-form.title') }));
  });
});
