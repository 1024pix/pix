import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render as renderScreen } from '@1024pix/ember-testing-library';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/children/list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('display children organizations list', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const organization1 = store.createRecord('organization', {
      id: 1,
      name: 'Collège The Night Watch',
      externalId: 'UA123456',
    });
    const organization2 = store.createRecord('organization', {
      id: 2,
      name: 'Lycée KingsLanding',
      externalId: 'UB64321',
    });
    this.set('organizations', [organization1, organization2]);

    //  when
    const screen = await renderScreen(hbs`<Organizations::Children::List @organizations={{this.organizations}}/>`);

    // then
    assert.dom(screen.getByRole('table', { name: 'Liste des organisations enfants' })).exists();

    assert.dom(screen.getByRole('columnheader', { name: 'ID' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Nom' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Identifiant externe' })).exists();

    assert.strictEqual((await screen.findAllByRole('row')).length, 3);

    assert.dom(screen.getByRole('row', { name: 'Collège The Night Watch' })).exists();
    assert.dom(screen.getByRole('row', { name: 'Lycée KingsLanding' })).exists();
  });
});
