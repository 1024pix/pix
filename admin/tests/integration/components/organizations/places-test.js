import { clickByText, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | Organizations | Places', function (hooks) {
  setupRenderingTest(hooks);

  let store;
  let currentUser;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    currentUser = this.owner.lookup('service:currentUser');
  });

  module('When user is superAdmin', function (hooks) {
    hooks.beforeEach(async function () {
      currentUser.adminMember = { isSuperAdmin: true };
    });

    test('it should display button to add places', async function (assert) {
      //Given
      this.set('places', []);

      // when
      const screen = await render(hbs`<Organizations::Places @places={{this.places}} />`);

      // then
      assert.dom(screen.getByText('Ajouter des places')).exists();
    });

    module('Display places', function () {
      test('it should display title and no results text', async function (assert) {
        //Given
        this.set('places', []);

        // when
        const screen = await render(hbs`<Organizations::Places @places={{this.places}} />`);

        // then
        assert.dom(screen.getByText('Historique des lots')).exists();
        assert.dom(screen.queryByText('Nombre')).doesNotExist();
        assert.dom(screen.getByText('Aucun lot de places saisi')).exists();
      });

      test('it should display places', async function (assert) {
        // given
        const places = store.createRecord('organization-place', {
          count: 7777,
          reference: 'FFVII',
          category: 'FULL_RATE',
          status: 'ACTIVE',
          activationDate: '1997-01-31',
          expirationDate: '2100-12-31',
          createdAt: '1996-01-12',
          creatorFullName: 'Hironobu Sakaguchi',
        });

        this.set('places', [places]);

        // when
        const screen = await render(hbs`<Organizations::Places @places={{this.places}} />`);

        // then
        assert.dom(screen.queryByText('Aucun résultat')).doesNotExist();
        assert.dom(screen.getByText('7777')).exists();
      });

      test('it should display modal to delete places lot', async function (assert) {
        // given
        const places = store.createRecord('organization-place', {
          count: 7777,
          reference: 'FFVII',
          category: 'FULL_RATE',
          status: 'ACTIVE',
          activationDate: '1997-01-31',
          expirationDate: '2100-12-31',
          createdAt: '1996-01-12',
          creatorFullName: 'Hironobu Sakaguchi',
        });
        this.set('places', [places]);

        // when
        const screen = await render(hbs`<Organizations::Places @places={{this.places}} />`);
        await clickByText('Supprimer');

        // then
        assert.dom(screen.getByText('Supprimer un lot de place')).exists();
      });
    });
  });

  module('When user is support', function (hooks) {
    hooks.beforeEach(async function () {
      currentUser.adminMember = { isSupport: true };
    });

    test('it should not display button to add places', async function (assert) {
      // given
      this.set('places', []);

      // when
      const screen = await render(hbs`<Organizations::Places @places={{this.places}} />`);

      // then
      assert.dom(screen.queryByText('Ajouter des places')).doesNotExist();
    });

    test('it should not display button to delete places lot', async function (assert) {
      // given
      const places = store.createRecord('organization-place', {
        count: 7777,
        reference: 'FFVII',
        category: 'FULL_RATE',
        status: 'ACTIVE',
        activationDate: '1997-01-31',
        expirationDate: '2100-12-31',
        createdAt: '1996-01-12',
        creatorFullName: 'Hironobu Sakaguchi',
      });

      this.set('places', [places]);

      // when
      const screen = await render(hbs`<Organizations::Places @places={{this.places}} />`);

      // then
      assert.dom(screen.queryByText('Supprimer')).doesNotExist();
    });
  });
});
