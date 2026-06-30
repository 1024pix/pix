import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseBlueprintContent from 'pix-orga/components/catalogue/course-modal/combined-course-blueprint-content';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Catalogue | Course Modale::CombinedCourseBlueprintContent', function (hooks) {
  setupIntlRenderingTest(hooks);
  test('it shows combined course explanation', async function (assert) {
    const store = this.owner.lookup('service:store');

    //given
    const blueprint = store.createRecord('combined-course-blueprint-overview', {
      name: 'Le module EDU',
      illustration: 'mon-image.svg',
      description: 'description',
      items: [],
    });

    const screen = await render(
      <template><CombinedCourseBlueprintContent @combinedCourseBlueprint={{blueprint}} /></template>,
    );

    assert
      .dom(screen.getByRole('heading', { level: 3, name: t('pages.catalogue.modal.combined-course-content.title') }))
      .exists();
    assert.dom(screen.getByText(t('pages.catalogue.modal.combined-course-content.description'))).exists();
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
  test('it shows the combined course blueprint content items name', async function (assert) {
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
    const blueprint = store.createRecord('combined-course-blueprint-overview', {
      name: 'Le module EDU',
      illustration: 'mon-image.svg',
      description: 'description',
      items: [itemEval, itemModule],
    });

    const screen = await render(
      <template><CombinedCourseBlueprintContent @combinedCourseBlueprint={{blueprint}} /></template>,
    );

    const steps = screen.getAllByRole('heading', { level: 4 });
    assert.strictEqual(steps.length, 2);
  });
});
