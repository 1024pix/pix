import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User-Tutorials | Filters | ItemCheckbox', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when currentFilters contains item', function () {
    test('should show checked checkbox', async function (assert) {
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
            />`,
      );

      // then
      assert.true(find('input').checked);
    });
  });

  module('when currentFilters not contains item', function () {
    test('should show not checked checkbox', async function (assert) {
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
            />`,
      );

      // then
      assert.false(find('input').checked);
    });
  });
});
