import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Organizations | Places | List', function (hooks) {
  setupRenderingTest(hooks);

  let store;
  let currentUser;
  let onDelete;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    currentUser = this.owner.lookup('service:currentUser');
    onDelete = sinon.stub();
  });

  module('When user is superAdmin', function (hooks) {
    hooks.beforeEach(async function () {
      currentUser.adminMember = { isSuperAdmin: true };
    });

    module('Display places', function () {
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
        this.set('onDelete', onDelete);

        // when
        const screen = await render(
          hbs`<Organizations::Places::List @places={{this.places}} @onDelete={{this.onDelete}} />`,
        );

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

      test('it should call onDelete', async function (assert) {
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
        this.set('onDelete', onDelete);

        // when
        const screen = await render(
          hbs`<Organizations::Places::List @places={{this.places}} @onDelete={{this.onDelete}} />`,
        );
        await click(screen.getByText('Supprimer'));

        // then
        sinon.assert.calledWith(onDelete, places);
        assert.ok(true);
      });
    });
  });
});
