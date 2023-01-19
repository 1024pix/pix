import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User-Tutorials | Filters | Sidebar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when isVisible param is true', function () {
    test('should show sidebar with areas', async function (assert) {
      // given
      this.set('isVisible', true);
      this.set('areas', [
        { id: 'area1', title: 'Area 1' },
        { id: 'area2', title: 'Area 2' },
        { id: 'area3', title: 'Area 3' },
      ]);
      this.set('onSubmit', () => {});
      this.set('onClose', () => {});

      // when
      await render(
        hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} @onSubmit={{this.onSubmit}} @onClose={{this.onClose}} @areas={{this.areas}}/>`
      );

      // then
      assert.dom('.tutorials-filters').exists();
      assert.dom('.tutorials-filters__areas').exists({ count: 3 });
    });

    module('when filters is clicked', function () {
      test('should add it on selected filters', async function (assert) {
        // given
        this.set('isVisible', true);
        this.set('areas', [
          { id: 'area1', title: 'Area 1', sortedCompetences: [{ id: 'competence1', name: 'Ma superbe compétence' }] },
        ]);
        this.set('onSubmit', () => {});
        this.set('onSubmit', () => {});
        this.set('onClose', () => {});

        // when
        const screen = await render(
          hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} @onSubmit={{this.onSubmit}} @onClose={{this.onClose}} @areas={{this.areas}}/>`
        );
        await click(screen.getByRole('button', { name: 'Area 1' }));
        const checkbox = screen.getByRole('checkbox', { name: 'Ma superbe compétence' });

        // when
        await click(checkbox);

        // then
        assert.true(checkbox.checked);
      });
    });

    module('when filters is selected', function () {
      module('when reset button is clicked', function () {
        test('should reset all filters', async function (assert) {
          // given
          this.set('isVisible', true);
          this.set('areas', [
            { id: 'area1', title: 'Area 1', sortedCompetences: [{ id: 'competence1', name: 'Ma superbe compétence' }] },
          ]);
          this.set('onSubmit', () => {});
          this.set('onClose', () => {});

          // when
          const screen = await render(
            hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} @onSubmit={{this.onSubmit}} @onClose={{this.onClose}} @areas={{this.areas}}/>`
          );
          await click(screen.getByRole('button', { name: 'Area 1' }));
          const checkbox = screen.getByRole('checkbox', { name: 'Ma superbe compétence' });
          await click(checkbox);

          // when
          await click(
            screen.getByRole('button', { name: this.intl.t('pages.user-tutorials.sidebar.reset-aria-label') })
          );

          // then
          assert.false(checkbox.checked);
        });
      });
    });
  });

  module('when isVisible param is false', function () {
    test('should not show sidebar', async function (assert) {
      // given
      this.set('isVisible', false);
      this.set('onSubmit', () => {});
      this.set('onClose', () => {});

      // when
      await render(
        hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} @onSubmit={{this.onSubmit}} @onClose={{this.onClose}} @areas={{this.areas}}/>`
      );

      // then
      assert.dom('.pix-sidebar--hidden').exists();
    });
  });
});
