import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import List from 'pix-admin/components/organizations/places/list';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Organizations | Places | List', function (hooks) {
  setupRenderingTest(hooks);

  module('When user is superAdmin', function (hooks) {
    let store;
    let currentUser;

    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };
    });

    const onDelete = sinon.stub();

    module('Display places', function () {
      test('it should display places', async function (assert) {
        // given
        const places = [
          store.createRecord('organization-place', {
            count: 7777,
            reference: 'FFVII',
            category: 'FULL_RATE',
            status: 'ACTIVE',
            activationDate: '1997-01-31',
            expirationDate: '2100-12-31',
            createdAt: '1996-01-12',
            creatorFullName: 'Hironobu Sakaguchi',
          }),
        ];

        // when
        const screen = await render(<template><List @places={{places}} @onDelete={{onDelete}} /></template>);

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
        const places = [
          store.createRecord('organization-place', {
            count: 7777,
            reference: 'FFVII',
            category: 'FULL_RATE',
            status: 'ACTIVE',
            activationDate: '1997-01-31',
            expirationDate: '2100-12-31',
            createdAt: '1996-01-12',
            creatorFullName: 'Hironobu Sakaguchi',
          }),
        ];

        // when
        const screen = await render(<template><List @places={{places}} @onDelete={{onDelete}} /></template>);
        await click(screen.getByText('Supprimer'));

        // then
        sinon.assert.calledWith(onDelete, places[0]);
        assert.ok(true);
      });
    });
  });
});
