import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Profile::Table', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when profile is not shared', function () {
    test('it displays empty table message', async function (assert) {
      this.isShared = false;
      this.competences = [];

      const screen = await render(
        hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`,
      );

      assert.ok(screen.getByText(this.intl.t('pages.profiles-individual-results.table.empty')));
    });
  });

  module('when profile is shared', function () {
    test('it displays area color as border', async function (assert) {
      this.competences = [{ name: 'name1', areaColor: 'jaffa' }];
      this.isShared = true;

      await render(hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`);

      assert.ok('.competences-col__border--jaffa');
    });

    test('it displays multiple competences in the table', async function (assert) {
      this.competences = [{ name: 'name1' }, { name: 'name2' }];
      this.isShared = true;

      const screen = await render(
        hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`,
      );

      assert.ok(screen.getByRole('cell', { name: 'name1' }));
      assert.ok(screen.getByRole('cell', { name: 'name2' }));
    });

    test('it displays the table with competence informations', async function (assert) {
      this.competences = [{ estimatedLevel: 999, pixScore: 666 }];
      this.isShared = true;

      const screen = await render(
        hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`,
      );

      assert.ok(screen.getByRole('cell', { name: '666' }));
      assert.ok(screen.getByRole('cell', { name: '999' }));
    });
  });
});
