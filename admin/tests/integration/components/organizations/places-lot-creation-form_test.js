import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

module('Integration | Component | organizations/places-lot-creation-form', function (hooks) {
  setupRenderingTest(hooks);

  test('Should send add organization places set request to API', async function (assert) {
    // given
    this.create = sinon.stub();

    const placesLot = {
      count: '10',
      activationDate: '2022-10-20',
      expirationDate: '2022-12-20',
      category: 'FREE_RATE',
      reference: '123ABC',
    };

    const screen = await render(hbs`<Organizations::PlacesLotCreationForm @create={{this.create}} />`);

    // when
    await fillByLabel('Nombre :', '10');
    await fillByLabel("* Date d'activation :", '2022-10-20');
    await fillByLabel("Date d'expiration :", '2022-12-20');

    const select = screen.getByRole('button', { name: /Catégorie/ });

    await click(select);

    await screen.findByRole('listbox');

    await click(screen.getByRole('option', { name: 'Tarif gratuit' }));

    await fillByLabel('* Référence :', '123ABC');
    await clickByName('Ajouter');
    // then
    sinon.assert.calledWith(this.create, placesLot);
    assert.ok(true);
  });
});
