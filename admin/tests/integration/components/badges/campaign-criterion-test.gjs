import { clickByName, fillByLabel, fireEvent, render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import CampaignCriterion from 'pix-admin/components/badges/campaign-criterion';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Badges::CampaignCriterion', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a CampaignParticipation criterion', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const criterion = store.createRecord('badge-criterion', {
      id: 123,
      threshold: 60,
    });

    // when
    const screen = await render(<template><CampaignCriterion @criterion={{criterion}} /></template>);

    // then
    assert.deepEqual(
      screen.getByTestId('campaign-criterion-text').innerText,
      "L'évalué doit obtenir 60% sur l'ensemble des sujets du profil cible.",
    );
  });

  module('#update', function () {
    module('when the target profile is linked with a campaign', function () {
      test('should display a disabled edit button', async function (assert) {
        // when
        const store = this.owner.lookup('service:store');
        const criterion = store.createRecord('badge-criterion', {
          id: 123,
          threshold: 60,
        });

        const screen = await render(
          <template><CampaignCriterion @criterion={{criterion}} @isEditable={{false}} /></template>,
        );

        fireEvent.mouseOver(screen.getByRole('button', { name: 'Modifier le seuil de ce critère' }));

        // then
        assert.true(screen.getByRole('button', { name: 'Modifier le seuil de ce critère' }).disabled);
        assert.dom(screen.getByText(/Non modifiable car le profil cible est relié à une campagne/)).exists();
        assert.notOk(screen.queryByText(/Modification du critère d'obtention basé sur l'ensemble du profil cible/));
      });
    });

    module('when the target profile is not linked with a campaign', function () {
      test('should display an edit modal with a filled input', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const criterion = store.createRecord('badge-criterion', {
          scope: 'CampaignParticipation',
          threshold: 60,
          save: sinon.stub(),
        });

        // when
        const screen = await render(
          <template><CampaignCriterion @criterion={{criterion}} @isEditable={{true}} /></template>,
        );
        await clickByName('Modifier le seuil de ce critère');
        const modal = within(await screen.findByRole('dialog'));
        // then
        assert.notOk(this.element.querySelector('.pix-modal__overlay--hidden'));
        assert.dom(modal.getByDisplayValue(60)).exists();
      });

      test('should close the edit modal on cancel action', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const criterion = store.createRecord('badge-criterion', {
          scope: 'CampaignParticipation',
          threshold: 60,
          save: sinon.stub(),
        });

        // when
        const screen = await render(
          <template><CampaignCriterion @criterion={{criterion}} @isEditable={{true}} /></template>,
        );
        await clickByName('Modifier le seuil de ce critère');
        const modal = within(await screen.findByRole('dialog'));
        await click(modal.getByRole('button', { name: 'Annuler' }));
        assert.dom(this.element.querySelector('.pix-modal__overlay--hidden')).exists();
      });

      test('should call the save method and success notification service', async function (assert) {
        const store = this.owner.lookup('service:store');
        const criterion = store.createRecord('badge-criterion', {
          scope: 'CampaignParticipation',
          threshold: 60,
          save: sinon.stub(),
        });

        // given
        const notificationSuccessStub = sinon.stub();
        class NotificationsStub extends Service {
          sendSuccessNotification = notificationSuccessStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        // when
        const screen = await render(
          <template><CampaignCriterion @criterion={{criterion}} @isEditable={{true}} /></template>,
        );
        await clickByName('Modifier le seuil de ce critère');
        const modal = within(await screen.findByRole('dialog'));
        // given
        criterion.save.resolves();

        // when
        await fillByLabel(/Nouveau seuil d'obtention du critère :/, 33);
        assert.dom(modal.getByDisplayValue(33)).exists();

        await click(modal.getByRole('button', { name: 'Enregistrer' }));

        //then
        assert.ok(criterion.save.called);
        sinon.assert.calledWith(notificationSuccessStub, {
          message: "Seuil d'obtention du critère modifié avec succès.",
        });
        assert.dom(this.element.querySelector('.pix-modal__overlay--hidden')).exists();
      });

      test('should display an error notification', async function (assert) {
        const store = this.owner.lookup('service:store');
        const criterion = store.createRecord('badge-criterion', {
          scope: 'CampaignParticipation',
          threshold: 60,
          save: sinon.stub(),
        });

        // given
        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        // when
        const screen = await render(
          <template><CampaignCriterion @criterion={{criterion}} @isEditable={{true}} /></template>,
        );
        await clickByName('Modifier le seuil de ce critère');
        const modal = within(await screen.findByRole('dialog'));
        // given
        criterion.save.throws({
          errors: [
            {
              detail: "Il est interdit de modifier un critère d'un badge déjà acquis par un utilisateur.",
            },
          ],
        });

        // when
        await click(modal.getByRole('button', { name: 'Enregistrer' }));

        // then
        sinon.assert.calledWith(notificationErrorStub, {
          message: "Il est interdit de modifier un critère d'un badge déjà acquis par un utilisateur.",
        });
        assert.ok(true);
      });
    });
  });
});
