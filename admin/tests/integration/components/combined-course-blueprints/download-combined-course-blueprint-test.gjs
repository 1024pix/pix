import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import DownloadCombinedCourseBlueprint from 'pix-admin/components/combined-course-blueprints/download-combined-course-blueprint';
import { COMBINED_COURSE_ITEM_TYPES } from 'pix-admin/models/combined-course-blueprint.js';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';

module('Integration | Component | CombinedCourseBlueprints::DownloadCombinedCourseBlueprint', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should download a csv ready to import for combined course creation', async function (assert) {
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

    const creatorId = 456;

    // when
    const screen = await render(
      <template>
        <DownloadCombinedCourseBlueprint @blueprint={{combinedCourseBlueprint}} @creatorId={{creatorId}} />
      </template>,
    );

    const expectedHref =
      'data:text/csv;charset=utf-8,%22Identifiant%20des%20organisations*%22%3B%22Identifiant%20du%20createur%20des%20campagnes*%22%3B%22Json%20configuration%20for%20quest*%22%3B%22Identifiant%20du%20sch%C3%A9ma%20de%20parcours*%22%0A%22%22%3B%22456%22%3B%22%7B%22%22name%22%22%3A%22%22Parcours%20apprenant%22%22%2C%22%22description%22%22%3A%22%22Mon%20super%20parcours%20apprenant%22%22%2C%22%22illustration%22%22%3A%22%22http%3A%2F%2Fpix.fr%2Fmon-illu.png%22%22%7D%22%3B%22123%22';
    const link = screen.getByRole('link', {
      name: t('components.combined-course-blueprints.list.downloadButton'),
    });

    assert.strictEqual(
      link.href,
      expectedHref,
      link.href !== expectedHref
        ? 'href is not equal to expected one, in case the CSV content changed, we need to copy href content from DOM and paste it into test'
        : 'okay',
    );
  });
});
