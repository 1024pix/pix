import { render } from '@1024pix/ember-testing-library';
import Table from 'pix-orga/components/participant/profile/table';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Profile::Table', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when profile is not shared', function () {
    test('it displays empty table message', async function (assert) {
      const isShared = false;
      const competences = [];

      const screen = await render(<template><Table @competences={{competences}} @isShared={{isShared}} /></template>);

      assert.ok(screen.getByText(t('pages.profiles-individual-results.table.empty')));
    });
  });

  module('when profile is shared', function () {
    test('it displays area color as border', async function (assert) {
      const competences = [{ name: 'name1', areaColor: 'jaffa' }];
      const isShared = true;

      await render(<template><Table @competences={{competences}} @isShared={{isShared}} /></template>);

      assert.ok('.competences-col__border--jaffa');
    });

    test('it displays multiple competences in the table', async function (assert) {
      const competences = [{ name: 'name1' }, { name: 'name2' }];
      const isShared = true;

      const screen = await render(<template><Table @competences={{competences}} @isShared={{isShared}} /></template>);

      assert.ok(screen.getByRole('cell', { name: 'name1' }));
      assert.ok(screen.getByRole('cell', { name: 'name2' }));
    });

    test('it displays the table with competence informations', async function (assert) {
      const competences = [{ estimatedLevel: 999, pixScore: 666 }];
      const isShared = true;

      const screen = await render(<template><Table @competences={{competences}} @isShared={{isShared}} /></template>);

      assert.ok(screen.getByRole('cell', { name: '666' }));
      assert.ok(screen.getByRole('cell', { name: '999' }));
    });
  });
});
