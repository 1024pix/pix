import { clickByName, fillByLabel, fireEvent, render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Badges::CampaignCriterion', function (hooks) {
  setupRenderingTest(hooks);

  test('should display a CampaignParticipation criterion', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const criterion = store.createRecord('badge-criterion', {
      id: 123,
      threshold: 60,
    });
    this.set('criterion', criterion);

    // when
    const screen = await render(hbs`<Badges::CampaignCriterion @criterion={{this.criterion}} />`);

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
        const screen = await render(
          hbs`<Badges::CampaignCriterion @criterion={{this.criterion}} @isEditable={{false}} />`,
        );

        fireEvent.mouseOver(screen.getByRole('button', { name: 'Modifier le critère' }));

        // then
        assert.true(screen.getByRole('button', { name: 'Modifier le critère' }).disabled);
        assert.dom(screen.getByText(/Non modifiable car le profil cible est relié à une campagne/)).exists();
        assert.notOk(screen.queryByText(/Modification du critère d'obtention basé sur l'ensemble du profil cible/));
      });
    });

    module('when the target profile is not linked with a campaign', function (hooks) {
      let modal, notificationErrorStub, notificationSuccessStub, screen, store;

      hooks.beforeEach(async function () {
        // given
        store = this.owner.lookup('service:store');

        const criterion = store.createRecord('badge-criterion', {
          scope: 'CampaignParticipation',
          threshold: 60,
          save: sinon.stub(),
        });
        this.set('criterion', criterion);

        notificationSuccessStub = sinon.stub();
        notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          success = notificationSuccessStub;
          error = notificationErrorStub;
        }
        this.owner.register('service:notifications', NotificationsStub);

        // when
        screen = await render(hbs`<Badges::CampaignCriterion @criterion={{this.criterion}} @isEditable={{true}} />`);
        await clickByName('Modifier le critère');
        modal = within(await screen.findByRole('dialog'));
      });

      test('should display an edit modal with a filled input', async function (assert) {
        // then
        assert.notOk(this.element.querySelector('.pix-modal__overlay--hidden'));
        assert.dom(modal.getByDisplayValue(60)).exists();
      });

      test('should close the edit modal on cancel action', async function (assert) {
        await click(modal.getByRole('button', { name: 'Annuler' }));
        assert.dom(this.element.querySelector('.pix-modal__overlay--hidden')).exists();
      });

      test('should call the save method and success notification service', async function (assert) {
        // given
        this.criterion.save.resolves();

        // when
        await fillByLabel(/Nouveau seuil d'obtention du critère :/, 33);
        assert.dom(modal.getByDisplayValue(33)).exists();

        await click(modal.getByRole('button', { name: 'Enregistrer' }));

        //then
        assert.ok(this.criterion.save.called);
        sinon.assert.calledWith(notificationSuccessStub, "Seuil d'obtention du critère modifié avec succès.");
        assert.dom(this.element.querySelector('.pix-modal__overlay--hidden')).exists();
      });

      test('should display an error notification', async function (assert) {
        // given
        this.criterion.save.throws();

        // when
        await click(modal.getByRole('button', { name: 'Enregistrer' }));

        // then
        sinon.assert.calledWith(
          notificationErrorStub,
          "Problème lors de la modification du seuil d'obtention du critère.",
        );
        assert.ok(true);
      });
    });
  });
});
