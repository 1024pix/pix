import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Organizations | places', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('Display places', function () {
    test('it should display title and no results text', async function (assert) {
      //Given
      this.set('places', []);

      // when
      const screen = await render(hbs`<Organizations::Places @places={{this.places}}/>`);

      // then
      assert.dom(screen.getByText('Historique des lots')).exists();

      assert.dom(screen.queryByText('Nombre')).doesNotExist();
      assert.dom(screen.queryByText('Catégorie')).doesNotExist();
      assert.dom(screen.queryByText("Date d'activation")).doesNotExist();
      assert.dom(screen.queryByText('Référence')).doesNotExist();
      assert.dom(screen.queryByText('Statut')).doesNotExist();
      assert.dom(screen.queryByText('Créé par')).doesNotExist();

      assert.dom(screen.getByText('Aucun lot de places saisi')).exists();
    });

    test('it should display places', async function (assert) {
      // given
      const places = store.createRecord('organizationPlace', {
        count: 7777,
        reference: 'FFVII',
        category: 'FULL_RATE',
        status: 'ACTIVE',
        activationDate: '1997-01-31',
        expiredDate: '2100-12-31',
        createdAt: '1996-01-12',
        creatorFullName: 'Hironobu Sakaguchi',
      });

      this.set('places', [places]);

      // when
      const screen = await render(hbs`<Organizations::Places @places={{this.places}}/>`);

      // then
      assert.dom(screen.queryByText('Aucun résultat')).doesNotExist();

      assert.dom(screen.getByText('Nombre')).exists();
      assert.dom(screen.getByText('Catégorie')).exists();
      assert.dom(screen.getByText("Date d'activation")).exists();
      assert.dom(screen.getByText('Référence')).exists();
      assert.dom(screen.getByText('Statut')).exists();
      assert.dom(screen.getByText('Créé par')).exists();

      assert.dom(screen.getByText('7777')).exists();
      assert.dom(screen.getByText('FFVII')).exists();
      assert.dom(screen.getByText('Tarif plein')).exists();
      assert.dom(screen.getByText('Actif')).exists();
      assert.dom(screen.getByText('Hironobu Sakaguchi')).exists();

      assert.dom(screen.getByText(/Du: 31\/01\/1997/)).exists();
      assert.dom(screen.getByText(/Au: 31\/12\/2100/)).exists();
    });
  });
});
