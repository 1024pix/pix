import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Profile::Table', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when profile is not shared', function () {
    test('it displays empty table message', async function (assert) {
      this.isShared = false;
      this.competences = [];

      await render(hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`);

      assert.contains('En attente de résultats');
    });
  });

  module('when profile is shared', function () {
    test('it displays area color as border', async function (assert) {
      this.competences = [{ name: 'name1', areaColor: 'jaffa' }];
      this.isShared = true;

      await render(hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`);

      assert.dom('.competences-col__border--jaffa').exists();
    });

    test('it displays multiple competences in the table', async function (assert) {
      this.competences = [{ name: 'name1' }, { name: 'name2' }];
      this.isShared = true;

      await render(hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`);

      assert.contains('name1');
      assert.contains('name2');
    });

    test('it displays the table with competence informations', async function (assert) {
      this.competences = [{ estimatedLevel: 999, pixScore: 666 }];
      this.isShared = true;

      await render(hbs`<Participant::Profile::Table @competences={{this.competences}} @isShared={{this.isShared}} />`);

      assert.contains('666');
      assert.contains('999');
    });
  });
});
