import { render as renderScreen } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import RequirementTag from 'pix-admin/components/common/combined-courses/requirement-tag';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component |  common/combined-courses/requirement-tag', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a module item when type is not evaluation', async function (assert) {
    const item = {
      type: 'module',
      value: 'full-id-abc-123',
      shortId: 'abc-123',
      label: 'Mon module',
    };
    const screen = await renderScreen(<template><RequirementTag @requirement={{item}} /></template>);
    assert.ok(screen.getByText(t('components.combined-course-blueprints.items.module'), { exact: false }));
    assert.ok(screen.getByText(item.shortId, { exact: false }));
    assert.ok(screen.getByText(item.label, { exact: false }));
    const link = screen.getByRole('link');
    assert.ok(link.getAttribute('href').endsWith('modules/abc-123/slug/details'));
  });

  test('should display a target profile item when type is evaluation', async function (assert) {
    const item = {
      type: 'evaluation',
      value: 1,
      label: 'Ma campagne',
    };
    const screen = await renderScreen(<template><RequirementTag @requirement={{item}} /></template>);
    const link = screen.getByRole('link');
    assert.ok(screen.getByText(t('components.combined-course-blueprints.items.targetProfile'), { exact: false }));
    assert.ok(screen.getByText(item.value, { exact: false }));
    assert.ok(screen.getByText(item.label, { exact: false }));
    assert.ok(link.getAttribute('href').endsWith(`/target-profiles/${item.value}/details`));
  });
});
