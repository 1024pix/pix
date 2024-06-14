import { clickByText, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Organizations | Places | Delete-modal', function (hooks) {
  setupRenderingTest(hooks);

  let store;
  let places;
  let organizationId;
  let toggleDisplayModal;
  let refreshModel;
  let showDisplayModal;
  let notificationSuccessStub;
  let notificationErrorStub;

  hooks.beforeEach(async function () {
    notificationSuccessStub = sinon.stub();
    notificationErrorStub = sinon.stub();
    refreshModel = sinon.stub();
    class NotificationsStub extends Service {
      success = notificationSuccessStub;
      error = notificationErrorStub;
    }

    this.owner.register('service:notifications', NotificationsStub);

    store = this.owner.lookup('service:store');
    places = store.createRecord('organization-place', {
      count: 7777,
      reference: 'FFVII',
      category: 'FULL_RATE',
      status: 'ACTIVE',
      activationDate: '1997-01-31',
      expirationDate: '2100-12-31',
      createdAt: '1996-01-12',
      creatorFullName: 'Hironobu Sakaguchi',
    });

    places.deleteRecord = sinon.stub();
    places.save = sinon.stub();

    organizationId = 1;
    toggleDisplayModal = sinon.stub();
    showDisplayModal = true;
  });

  module('Display delete Modal', function () {
    test('it should display delete modal', async function (assert) {
      // given
      this.set('organizationId', organizationId);
      this.set('places', places);
      this.set('showDisplayModal', showDisplayModal);
      this.set('toggleDisplayModal', toggleDisplayModal);

      // when
      const screen = await render(hbs`<Organizations::Places::DeleteModal
  @organizationId={{this.organizationId}}
  @organizationPlacesLot={{this.places}}
  @show={{this.showDisplayModal}}
  @toggle={{this.toggleDisplayModal}}
/>`);

      // then
      assert.dom(screen.getByText('Supprimer un lot de place')).exists();
      assert.dom(screen.getByText('Êtes-vous sûr de vouloir supprimer ce lot de place: FFVII ?')).exists();
      assert.dom(screen.getByText('Annuler')).exists();
      assert.dom(screen.getByText('Confirmer')).exists();
    });

    test('it should call toggle action on cancel button', async function (assert) {
      // given
      this.set('organizationId', organizationId);
      this.set('places', places);
      this.set('showDisplayModal', showDisplayModal);
      this.set('toggleDisplayModal', toggleDisplayModal);

      // when
      await render(hbs`<Organizations::Places::DeleteModal
  @organizationId={{this.organizationId}}
  @organizationPlacesLot={{this.places}}
  @show={{this.showDisplayModal}}
  @toggle={{this.toggleDisplayModal}}
/>`);
      await clickByText('Annuler');

      // then
      sinon.assert.calledOnce(toggleDisplayModal);
      assert.ok(true);
    });

    test('it should call store to delete places lot', async function (assert) {
      // given
      this.set('organizationId', organizationId);
      this.set('places', places);
      this.set('showDisplayModal', showDisplayModal);
      this.set('toggleDisplayModal', toggleDisplayModal);
      this.set('refreshModel', refreshModel);

      // when
      await render(hbs`<Organizations::Places::DeleteModal
  @organizationId={{this.organizationId}}
  @organizationPlacesLot={{this.places}}
  @show={{this.showDisplayModal}}
  @toggle={{this.toggleDisplayModal}}
  @refreshModel={{this.refreshModel}}
/>`);
      await clickByText('Confirmer');

      // then
      sinon.assert.calledOnce(places.deleteRecord);
      sinon.assert.calledWith(places.save, { adapterOptions: { organizationId } });
      sinon.assert.calledOnce(notificationSuccessStub);
      sinon.assert.calledOnce(refreshModel);
      sinon.assert.calledOnce(toggleDisplayModal);

      sinon.assert.callOrder(
        places.deleteRecord,
        places.save,
        notificationSuccessStub,
        refreshModel,
        toggleDisplayModal,
      );
      assert.ok(true);
    });

    test('it should call error notification', async function (assert) {
      // given
      this.set('organizationId', organizationId);
      this.set('places', places);
      this.set('showDisplayModal', showDisplayModal);
      this.set('toggleDisplayModal', toggleDisplayModal);

      places.save.throws({ errors: [{ status: '422', title: 'Erreur inconnue' }] });

      // when
      await render(hbs`<Organizations::Places::DeleteModal
  @organizationId={{this.organizationId}}
  @organizationPlacesLot={{this.places}}
  @show={{this.showDisplayModal}}
  @toggle={{this.toggleDisplayModal}}
/>`);
      await clickByText('Confirmer');

      // then
      sinon.assert.calledOnce(places.deleteRecord);
      sinon.assert.calledWith(places.save, { adapterOptions: { organizationId } });
      sinon.assert.calledOnce(notificationErrorStub);
      sinon.assert.calledOnce(toggleDisplayModal);

      sinon.assert.callOrder(places.deleteRecord, places.save, notificationErrorStub, toggleDisplayModal);
      assert.ok(true);
    });
  });
});
