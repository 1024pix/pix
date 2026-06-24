import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CombinedCourseBlueprintItem from 'pix-orga/components/catalogue/course-modal/combined-course-blueprint-item';
import { CombinedCourseBlueprintItemTypes } from 'pix-orga/models/combined-course-blueprint-item';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Catalogue | Course Modale::CombinedCourseBlueprintItem', function (hooks) {
  setupIntlRenderingTest(hooks);
  module('Evaluation item', function () {
    test('it shows the item name', async function (assert) {
      const store = this.owner.lookup('service:store');
      const item = store.createRecord('combined-course-blueprint-item', {
        name: 'Ma super formation',
        type: CombinedCourseBlueprintItemTypes.EVALUATION,
        duration: 5,
        image: 'illustration.svg',
      });

      const screen = await render(<template><CombinedCourseBlueprintItem @item={{item}} /></template>);

      assert.dom(screen.getByText('Ma super formation')).exists();
    });
  });
  module('Module item', function () {
    test('it shows the item name', async function (assert) {
      const store = this.owner.lookup('service:store');
      const item = store.createRecord('combined-course-blueprint-item', {
        name: 'Ma super formation',
        type: CombinedCourseBlueprintItemTypes.MODULE,
        duration: 5,
        image: 'illustration.svg',
      });

      const screen = await render(<template><CombinedCourseBlueprintItem @item={{item}} /></template>);

      assert.dom(screen.getByText('Ma super formation')).exists();
    });
    test('it shows the item image', async function (assert) {
      const store = this.owner.lookup('service:store');
      const item = store.createRecord('combined-course-blueprint-item', {
        name: 'Ma super formation',
        type: CombinedCourseBlueprintItemTypes.MODULE,
        duration: 5,
        image: 'illustration.svg',
      });
      const screen = await render(<template><CombinedCourseBlueprintItem @item={{item}} /></template>);

      const image = screen.getByRole('presentation', { visible: false });

      assert.ok(image.src.endsWith(item.image));
    });
    test('it shows if module is prescribed', async function (assert) {
      const store = this.owner.lookup('service:store');
      const item = store.createRecord('combined-course-blueprint-item', {
        name: 'Ma super formation',
        type: CombinedCourseBlueprintItemTypes.MODULE,
        duration: 5,
        isRecommendable: false,
        image: 'illustration.svg',
      });
      const screen = await render(<template><CombinedCourseBlueprintItem @item={{item}} /></template>);

      assert.dom(screen.getByText(t('pages.catalogue.modal.combined-course-content.prescribed'))).exists();
    });
    test('it shows if module is recommended', async function (assert) {
      const store = this.owner.lookup('service:store');
      const item = store.createRecord('combined-course-blueprint-item', {
        name: 'Ma super formation',
        type: CombinedCourseBlueprintItemTypes.MODULE,
        duration: 5,
        isRecommendable: true,
        image: 'illustration.svg',
      });
      const screen = await render(<template><CombinedCourseBlueprintItem @item={{item}} /></template>);

      assert.dom(screen.getByText(t('pages.catalogue.modal.combined-course-content.recommended'))).exists();
    });
    test('it shows module duration if provided', async function (assert) {
      const store = this.owner.lookup('service:store');
      const item = store.createRecord('combined-course-blueprint-item', {
        name: 'Ma super formation',
        type: CombinedCourseBlueprintItemTypes.MODULE,
        duration: 5,
        isRecommendable: true,
        image: 'illustration.svg',
      });
      const screen = await render(<template><CombinedCourseBlueprintItem @item={{item}} /></template>);
      assert
        .dom(
          screen.getByLabelText(
            t('pages.catalogue.modal.combined-course-content.aria-label-duration', { duration: item.duration }),
          ),
        )
        .exists();
      assert
        .dom(screen.getByText(t('pages.catalogue.modal.combined-course-content.duration', { duration: item.duration })))
        .exists();
    });
  });
});
