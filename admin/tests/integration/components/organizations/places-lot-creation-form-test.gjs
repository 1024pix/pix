import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import PlacesLotCreationForm from 'pix-admin/components/organizations/places-lot-creation-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | organizations/places-lot-creation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('Should send add organization places set request to API', async function (assert) {
    // given
    const create = sinon.stub();

    const screen = await render(<template><PlacesLotCreationForm @create={{create}} /></template>);

    // when
    await fillByLabel('Nombre :', '10');
    await fillByLabel("* Date d'activation :", '2022-10-20');
    await fillByLabel("Date d'expiration :", '2022-12-20');

    const select = screen.getByRole('button', { name: /Catégorie/ });

    await click(select);

    await click(await screen.findByRole('option', { name: 'Tarif gratuit' }));

    await fillByLabel('* Référence :', '123ABC');
    await click(screen.getByRole('button', { name: 'Ajouter' }));
    // then
    sinon.assert.calledOnce(create);
    assert.ok(true);
  });

  test('Should cannot click twice on validate button', async function (assert) {
    // given
    const create = sinon.stub().returns(new Promise(() => {}));

    const screen = await render(<template><PlacesLotCreationForm @create={{create}} /></template>);

    // when
    await fillByLabel('Nombre :', '10');
    await fillByLabel("* Date d'activation :", '2022-10-20');
    await fillByLabel("Date d'expiration :", '2022-12-20');

    const select = screen.getByRole('button', { name: /Catégorie/ });

    await click(select);

    await screen.findByRole('listbox');

    await click(await screen.findByRole('option', { name: 'Tarif gratuit' }));

    await fillByLabel('* Référence :', '123ABC');
    await click(screen.getByRole('button', { name: 'Ajouter' }));

    assert.throws(function () {
      screen.getByRole('button', { name: 'Ajouter' });
    });
  });
});
