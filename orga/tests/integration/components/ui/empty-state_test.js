import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::EmptyState', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a message telling if there is no participants', async function (assert) {
    // given
    this.set('infoText', "Aucun participant pour l'instant !");
    this.set('actionText', 'L’administrateur doit importer la base élèves en cliquant sur le bouton importer.');

    //when
    await render(hbs`<Ui::EmptyState @infoText={{this.infoText}} @actionText={{this.actionText}} />`);

    //then
    assert.contains("Aucun participant pour l'instant !");
    assert.contains('L’administrateur doit importer la base élèves en cliquant sur le bouton importer.');
  });
});
