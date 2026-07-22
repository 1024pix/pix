import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find, setupOnerror } from '@ember/test-helpers';
import ItemCheckbox from 'mon-pix/components/user-tutorials/filters/item-checkbox';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User-Tutorials | Filters | ItemCheckbox', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when no type param is provided', function () {
    test('should throw an error', async function (assert) {
      // given
      const item = { id: 'competencesId', name: 'Ma super compétence' };
      const currentFilters = { competences: [] };
      const handleFilterChange = () => {};

      let caughtError;
      setupOnerror((error) => {
        caughtError = error;
      });

      // when
      await render(
        <template>
          <ItemCheckbox @item={{item}} @currentFilters={{currentFilters}} @handleFilterChange={{handleFilterChange}} />
        </template>,
      );

      // then
      assert.ok(caughtError);
      assert.strictEqual(
        caughtError.message,
        'ERROR in UserTutorials::Filters::ItemCheckbox component, you must provide @type params',
      );
    });
  });

  module('when currentFilters contains item', function () {
    test('should show checked checkbox', async function (assert) {
      // given
      const item = { id: 'competencesId', name: 'Ma super compétence' };
      const currentFilters = { competences: ['competencesId'] };
      const handleFilterChange = () => {};

      // when
      await render(
        <template>
          <ItemCheckbox
            @type="competences"
            @item={{item}}
            @currentFilters={{currentFilters}}
            @handleFilterChange={{handleFilterChange}}
          />
        </template>,
      );

      // then
      assert.true(find('input').checked);
    });
  });

  module('when currentFilters not contains item', function () {
    test('should show not checked checkbox', async function (assert) {
      // given
      const item = { id: 'competencesId', name: 'Ma super compétence' };
      const currentFilters = { competences: [] };
      const handleFilterChange = () => {};

      // when
      await render(
        <template>
          <ItemCheckbox
            @type="competences"
            @item={{item}}
            @currentFilters={{currentFilters}}
            @handleFilterChange={{handleFilterChange}}
          />
        </template>,
      );

      // then
      assert.false(find('input').checked);
    });
  });
});
