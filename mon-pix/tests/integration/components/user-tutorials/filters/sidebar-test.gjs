import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Sidebar from 'mon-pix/components/user-tutorials/filters/sidebar';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User-Tutorials | Filters | Sidebar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when isVisible param is true', function () {
    test('should show sidebar with areas', async function (assert) {
      // given
      const isVisible = true;
      const areas = [
        { id: 'area1', title: 'Area 1' },
        { id: 'area2', title: 'Area 2' },
        { id: 'area3', title: 'Area 3' },
      ];
      const onSubmit = () => {};
      const onClose = () => {};

      // when
      await render(
        <template>
          <Sidebar @isVisible={{isVisible}} @onSubmit={{onSubmit}} @onClose={{onClose}} @areas={{areas}} />
        </template>,
      );

      // then
      assert.dom('.tutorials-filters').exists();
      assert.dom('.tutorials-filters__areas').exists({ count: 3 });
    });

    module('when filters is clicked', function () {
      test('should add it on selected filters', async function (assert) {
        // given
        const isVisible = true;
        const areas = [
          { id: 'area1', title: 'Area 1', sortedCompetences: [{ id: 'competence1', name: 'Ma superbe compétence' }] },
        ];
        const onSubmit = () => {};
        const onClose = () => {};

        // when
        const screen = await render(
          <template>
            <Sidebar @isVisible={{isVisible}} @onSubmit={{onSubmit}} @onClose={{onClose}} @areas={{areas}} />
          </template>,
        );
        await click(screen.getByRole('button', { name: 'Area 1' }));
        const checkbox = screen.getByRole('checkbox', { name: 'Ma superbe compétence' });

        // when
        await click(checkbox);

        // then
        assert.true(checkbox.checked);
      });

      module('when an already selected filter is clicked again', function () {
        test('should remove it from selected filters', async function (assert) {
          // given
          const isVisible = true;
          const areas = [
            { id: 'area1', title: 'Area 1', sortedCompetences: [{ id: 'competence1', name: 'Ma superbe compétence' }] },
          ];
          const onSubmit = () => {};
          const onClose = () => {};

          const screen = await render(
            <template>
              <Sidebar @isVisible={{isVisible}} @onSubmit={{onSubmit}} @onClose={{onClose}} @areas={{areas}} />
            </template>,
          );
          await click(screen.getByRole('button', { name: 'Area 1' }));
          const checkbox = screen.getByRole('checkbox', { name: 'Ma superbe compétence' });
          await click(checkbox);

          // when
          await click(checkbox);

          // then
          assert.false(checkbox.checked);
        });
      });
    });

    module('when filters is selected', function () {
      module('when reset button is clicked', function () {
        test('should reset all filters', async function (assert) {
          // given
          const isVisible = true;
          const areas = [
            { id: 'area1', title: 'Area 1', sortedCompetences: [{ id: 'competence1', name: 'Ma superbe compétence' }] },
          ];
          const onSubmit = () => {};
          const onClose = () => {};

          // when
          const screen = await render(
            <template>
              <Sidebar @isVisible={{isVisible}} @onSubmit={{onSubmit}} @onClose={{onClose}} @areas={{areas}} />
            </template>,
          );
          await click(screen.getByRole('button', { name: 'Area 1' }));
          const checkbox = screen.getByRole('checkbox', { name: 'Ma superbe compétence' });
          await click(checkbox);

          // when
          await click(screen.getByRole('button', { name: t('pages.user-tutorials.sidebar.reset-aria-label') }));

          // then
          assert.false(checkbox.checked);
        });
      });
    });
  });

  module('when isVisible param is false', function () {
    test('should not show sidebar', async function (assert) {
      // given
      const isVisible = false;
      const areas = undefined;
      const onSubmit = () => {};
      const onClose = () => {};

      // when
      const screen = await render(
        <template>
          <Sidebar @isVisible={{isVisible}} @onSubmit={{onSubmit}} @onClose={{onClose}} @areas={{areas}} />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('dialog', { name: 'Filtrer' })).doesNotExist();
    });
  });
});
