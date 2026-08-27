import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseBlueprintContent from 'pix-orga/components/catalogue/course-modal/combined-course-blueprint-content';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Catalogue | Course Modale::CombinedCourseBlueprintContent', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('step number title', function () {
    test('it shows titles and content of each step', async function (assert) {
      const store = this.owner.lookup('service:store');

      //given
      const itemEval = store.createRecord('combined-course-blueprint-item', {
        name: 'Diagnostic',
        type: 'evaluation',
      });
      const itemModule = store.createRecord('combined-course-blueprint-item', {
        name: 'Le module IA',
        type: 'module',
        duration: 5,
        image: 'mon-image.svg',
        isRecommendable: true,
      });
      const itemModule2 = store.createRecord('combined-course-blueprint-item', {
        name: 'Le module IA 2',
        type: 'module',
        duration: 5,
        image: 'mon-image.svg',
        isRecommendable: true,
      });
      const itemEval2 = store.createRecord('combined-course-blueprint-item', {
        name: 'Diagnostic2',
        type: 'evaluation',
      });
      const itemModule3 = store.createRecord('combined-course-blueprint-item', {
        name: 'Le module IA 3',
        type: 'module',
        duration: 5,
        image: 'mon-image.svg',
        isRecommendable: false,
      });
      const blueprint = store.createRecord('combined-course-blueprint-overview', {
        name: 'Le module EDU',
        illustration: 'mon-image.svg',
        description: 'description',
        items: [itemEval, itemModule, itemModule2, itemEval2, itemModule3],
      });

      // when
      const screen = await render(
        <template><CombinedCourseBlueprintContent @combinedCourseBlueprint={{blueprint}} /></template>,
      );

      // then
      const stepTitle1 = screen.getByRole('heading', {
        name: t('pages.catalogue.modal.combined-course-content.step', { number: 1 }),
      });
      const stepTitle2 = screen.getByRole('heading', {
        name: t('pages.catalogue.modal.combined-course-content.step', { number: 2 }),
      });
      const stepTitle3 = screen.getByRole('heading', {
        name: t('pages.catalogue.modal.combined-course-content.step', { number: 3 }),
      });
      const stepTitle4 = screen.getByRole('heading', {
        name: t('pages.catalogue.modal.combined-course-content.step', { number: 4 }),
      });

      assert.dom(stepTitle1).exists();
      assert.dom(screen.getByText(itemEval.name)).exists();

      assert.dom(stepTitle2).exists();
      assert.dom(screen.getByText(itemModule.name)).exists();
      assert.dom(screen.getByText(itemModule2.name)).exists();

      assert.dom(stepTitle3).exists();
      assert.dom(screen.getByText(itemEval2.name)).exists();

      assert.dom(stepTitle4).exists();
      assert.dom(screen.getByText(itemModule3.name)).exists();
    });

    test('it shows step content without title if only one step', async function (assert) {
      const store = this.owner.lookup('service:store');

      //given
      const itemEval = store.createRecord('combined-course-blueprint-item', {
        name: 'Diagnostic',
        type: 'evaluation',
      });
      const blueprint = store.createRecord('combined-course-blueprint-overview', {
        name: 'Le module EDU',
        illustration: 'mon-image.svg',
        description: 'description',
        items: [itemEval],
      });

      // when
      const screen = await render(
        <template><CombinedCourseBlueprintContent @combinedCourseBlueprint={{blueprint}} /></template>,
      );

      // then
      const stepTitle1 = screen.queryByRole('heading', {
        name: t('pages.catalogue.modal.combined-course-content.step', { number: 1 }),
      });
      assert.dom(stepTitle1).doesNotExist();
      assert.dom(screen.getByText(itemEval.name)).exists();
    });
  });

  test('it shows explanation for module step', async function (assert) {
    const store = this.owner.lookup('service:store');

    const itemModule = store.createRecord('combined-course-blueprint-item', {
      name: 'Le module IA',
      type: 'module',
      duration: 5,
      image: 'mon-image.svg',
      isRecommendable: true,
    });
    const blueprint = store.createRecord('combined-course-blueprint-overview', {
      name: 'Le module EDU',
      illustration: 'mon-image.svg',
      description: 'description',
      items: [itemModule],
    });
    const screen = await render(
      <template><CombinedCourseBlueprintContent @combinedCourseBlueprint={{blueprint}} /></template>,
    );

    assert.dom(screen.getByText(t('pages.catalogue.modal.combined-course-content.module-info'))).exists();
  });

  test('it hides explanation for module step if there are no module step', async function (assert) {
    const store = this.owner.lookup('service:store');

    const itemEval = store.createRecord('combined-course-blueprint-item', {
      name: 'Diagnostic',
      type: 'evaluation',
    });
    const blueprint = store.createRecord('combined-course-blueprint-overview', {
      name: 'Le module EDU',
      illustration: 'mon-image.svg',
      description: 'description',
      items: [itemEval],
    });
    const screen = await render(
      <template><CombinedCourseBlueprintContent @combinedCourseBlueprint={{blueprint}} /></template>,
    );

    assert.dom(screen.queryByText(t('pages.catalogue.modal.combined-course-content.module-info'))).doesNotExist();
  });
});
