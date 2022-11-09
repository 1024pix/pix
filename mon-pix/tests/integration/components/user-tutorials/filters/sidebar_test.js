import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, findAll, render, click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | User-Tutorials | Filters | Sidebar', function () {
  setupIntlRenderingTest();

  describe('when isVisible param is true', function () {
    it('should show sidebar with areas', async function () {
      // given
      this.set('isVisible', true);
      this.set('areas', [
        { id: 'area1', title: 'Area 1' },
        { id: 'area2', title: 'Area 2' },
        { id: 'area3', title: 'Area 3' },
      ]);

      // when
      await render(hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} @areas={{this.areas}} />`);

      // then
      expect(find('.tutorials-filters')).to.exist;
      expect(findAll('.tutorials-filters__areas')).to.have.lengthOf(3);
    });

    describe('when filters is clicked', function () {
      it('should add it on selected filters', async function () {
        // given
        this.set('isVisible', true);
        this.set('areas', [
          { id: 'area1', title: 'Area 1', sortedCompetences: [{ id: 'competence1', name: 'Ma superbe compétence' }] },
        ]);
        this.set('onSubmit', () => {});
        const screen = await renderScreen(
          hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} @areas={{this.areas}} @onSubmit={{this.onSubmit}} />`
        );
        await click(screen.getByRole('button', { name: 'Area 1' }));
        const checkbox = screen.getByRole('checkbox', { name: 'Ma superbe compétence' });

        // when
        await click(checkbox);

        // then
        expect(checkbox.checked).to.be.true;
      });
    });

    describe('when filters is selected', function () {
      describe('when reset button is clicked', function () {
        it('should reset all filters', async function () {
          // given
          this.set('isVisible', true);
          this.set('areas', [
            { id: 'area1', title: 'Area 1', sortedCompetences: [{ id: 'competence1', name: 'Ma superbe compétence' }] },
          ]);
          this.set('onSubmit', () => {});
          const screen = await renderScreen(
            hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} @areas={{this.areas}} @onSubmit={{this.onSubmit}} />`
          );
          await click(screen.getByRole('button', { name: 'Area 1' }));
          const checkbox = screen.getByRole('checkbox', { name: 'Ma superbe compétence' });
          await click(checkbox);

          // when
          await click(screen.getByRole('button', { name: 'Réinitialiser' }));

          // then
          expect(checkbox.checked).to.be.false;
        });
      });
    });
  });

  describe('when isVisible param is false', function () {
    it('should not show sidebar', async function () {
      // given
      this.set('isVisible', false);

      // when
      await render(hbs`<UserTutorials::Filters::Sidebar @isVisible={{this.isVisible}} />`);

      // then
      expect(find('.pix-sidebar--hidden')).to.exist;
    });
  });
});
