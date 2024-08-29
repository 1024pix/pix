import { clickByText, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import DeleteModal from 'pix-admin/components/organizations/places/delete-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Organizations | Places | Delete-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  const places = {
    count: 7777,
    reference: 'FFVII',
    category: 'FULL_RATE',
    status: 'ACTIVE',
    activationDate: '1997-01-31',
    expirationDate: '2100-12-31',
    createdAt: '1996-01-12',
    creatorFullName: 'Hironobu Sakaguchi',
  };

  places.deleteRecord = sinon.stub();
  places.save = sinon.stub();

  const organizationId = 1;
  const toggleDisplayModal = sinon.stub();
  const showDisplayModal = true;

  const notificationSuccessStub = sinon.stub();
  const notificationErrorStub = sinon.stub();
  const refreshModel = sinon.stub();

  hooks.beforeEach(async function () {
    class NotificationsStub extends Service {
      success = notificationSuccessStub;
      error = notificationErrorStub;
    }
    this.owner.register('service:notifications', NotificationsStub);
  });

  module('Display delete Modal', function () {
    test('it should display delete modal', async function (assert) {
      // when
      const screen = await render(
        <template>
          <DeleteModal
            @organizationId={{organizationId}}
            @organizationPlacesLot={{places}}
            @show={{showDisplayModal}}
            @toggle={{toggleDisplayModal}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText('Supprimer un lot de place')).exists();
      assert.dom(screen.getByText('Êtes-vous sûr de vouloir supprimer ce lot de place: FFVII ?')).exists();
      assert.dom(screen.getByText('Annuler')).exists();
      assert.dom(screen.getByText('Confirmer')).exists();
    });

    test('it should call toggle action on cancel button', async function (assert) {
      // when
      await render(
        <template>
          <DeleteModal
            @organizationId={{organizationId}}
            @organizationPlacesLot={{places}}
            @show={{showDisplayModal}}
            @toggle={{toggleDisplayModal}}
          />
        </template>,
      );
      await clickByText('Annuler');

      // then
      sinon.assert.calledOnce(toggleDisplayModal);
      assert.ok(true);
    });

    test('it should call store to delete places lot', async function (assert) {
      const toggleDisplayModal = sinon.stub();

      // when
      await render(
        <template>
          <DeleteModal
            @organizationId={{organizationId}}
            @organizationPlacesLot={{places}}
            @show={{showDisplayModal}}
            @toggle={{toggleDisplayModal}}
            @refreshModel={{refreshModel}}
          />
        </template>,
      );
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
      places.deleteRecord = sinon.stub();
      const toggleDisplayModal = sinon.stub();
      places.save.throws({ errors: [{ status: '422', title: 'Erreur inconnue' }] });

      // when
      await render(
        <template>
          <DeleteModal
            @organizationId={{organizationId}}
            @organizationPlacesLot={{places}}
            @show={{showDisplayModal}}
            @toggle={{toggleDisplayModal}}
          />
        </template>,
      );
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
