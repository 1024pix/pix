import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | User-Tutorials | Filters | ItemCheckbox', function () {
  setupIntlRenderingTest();

  describe('when currentFilters contains item', function () {
    it('should show checked checkbox', async function () {
      // given
      this.set('item', { id: 'competencesId', name: 'Ma super compétence' });
      this.set('currentFilters', { competences: ['competencesId'] });
      this.set('handleFilterChange', () => {});

      // when
      await render(
        hbs`<UserTutorials::Filters::ItemCheckbox
              @type="competences"
              @item={{this.item}}
              @currentFilters={{this.currentFilters}}
              @handleFilterChange={{this.handleFilterChange}}
            />`
      );

      // then
      expect(find('input').checked).to.be.true;
    });
  });

  describe('when currentFilters not contains item', function () {
    it('should show not checked checkbox', async function () {
      // given
      this.set('item', { id: 'competencesId', name: 'Ma super compétence' });
      this.set('currentFilters', { competences: [] });
      this.set('handleFilterChange', () => {});

      // when
      await render(
        hbs`<UserTutorials::Filters::ItemCheckbox
              @type="competences"
              @item={{this.item}}
              @currentFilters={{this.currentFilters}}
              @handleFilterChange={{this.handleFilterChange}}
            />`
      );

      // then
      expect(find('input').checked).to.be.false;
    });
  });
});
