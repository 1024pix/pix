import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ListSummaryItems from 'pix-admin/components/combined-course-blueprints/list-summary-items';
import { COMBINED_COURSE_ITEM_TYPES } from 'pix-admin/models/combined-course-blueprint';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';

module('Integration | Component | CombinedCourseBlueprints::ListSummaryItems', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const currentUser = this.owner.lookup('service:current-user');
    currentUser.adminMember = { userId: 456 };
  });

  test('it should display combined courses summary', async function (assert) {
    // given
    const combinedCourseBlueprint = {
      id: 123,
      internalName: 'Modèle de parcours apprenant',
      createdAt: new Date('2025-12-25'),
      name: 'Parcours apprenant',
      description: 'Mon super parcours apprenant',
      illustration: 'http://pix.fr/mon-illu.png',
      content: [{ type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: 'abc-123' }],
    };

    const summaries = [combinedCourseBlueprint];

    // when
    const screen = await render(<template><ListSummaryItems @summaries={{summaries}} /></template>);

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByRole('link', { name: 'Modèle de parcours apprenant' })).exists();
    assert.dom(screen.getByText('25/12/2025')).exists();
    assert.ok(screen.getByRole('link', { name: t('components.combined-course-blueprints.list.downloadButton') }));
  });
});
