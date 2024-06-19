import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::DeleteParticipationModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#deleteParticipation', function () {
    module('when the user click to delete the campaign participation', function (hooks) {
      let participation;
      let campaign;
      const deleteCampaignParticipation = sinon.stub();
      const closeModal = sinon.stub();

      hooks.beforeEach(async function () {
        campaign = { id: '90', idPixLabel: 'id', type: 'ASSESSMENT' };
        participation = {
          id: '56',
          firstName: 'Joe',
          lastName: 'La frite',
          status: 'TO_SHARE',
          participantExternalId: 'patate',
        };

        this.set('campaign', campaign);
        this.set('participation', participation);
        this.closeModal = closeModal;
        this.deleteCampaignParticipation = deleteCampaignParticipation;
        this.isModalOpen = true;
      });

      test('it displays the modal to confirm the deletion', async function (assert) {
        const screen = await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);

        assert.ok(screen.getByRole('heading', { name: 'Supprimer la participation de Joe La frite ?' }));
        assert.ok(screen.getByText(this.intl.t('pages.campaign-activity.delete-participation-modal.text')));
        assert.ok(screen.getByText(this.intl.t('pages.campaign-activity.delete-participation-modal.actions.cancel')));
        assert.ok(
          screen.getByRole('button', {
            name: this.intl.t('pages.campaign-activity.delete-participation-modal.actions.confirmation'),
          }),
        );
      });

      module('When the user clicks on cancel button', function () {
        test('it closes the modal and not delete the campaign participation', async function (assert) {
          await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);

          await clickByName(this.intl.t('pages.campaign-activity.delete-participation-modal.actions.cancel'));

          assert.ok(closeModal.calledOnce);
        });
      });

      module('When the user clicks on confirmation button', function () {
        test('it deletes the campaign participation', async function (assert) {
          await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);
          await clickByName(this.intl.t('pages.campaign-activity.delete-participation-modal.actions.confirmation'));

          assert.ok(deleteCampaignParticipation.called);
        });
      });

      module('When the warning is different according to the campaign type and the participation status', function () {
        test('it is a started participation for an assessment campaign', async function (assert) {
          this.set('campaign.type', 'ASSESSMENT');
          this.set('participation.status', 'STARTED');

          const screen = await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);

          assert.ok(
            screen.getByText(
              this.intl.t(
                'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.started-participation',
              ),
            ),
          );
        });

        test('it is a participation to share for an assessment campaign', async function (assert) {
          this.set('campaign.type', 'ASSESSMENT');
          this.set('participation.status', 'TO_SHARE');

          const screen = await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);

          assert.ok(
            screen.getByText(
              this.intl.t(
                'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.to-share-participation',
              ),
            ),
          );
        });

        test('it is a shared participation for an assessment campaign', async function (assert) {
          this.set('campaign.type', 'ASSESSMENT');
          this.set('participation.status', 'SHARED');

          const screen = await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);

          assert.ok(
            screen.getByText(
              this.intl.t(
                'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.shared-participation',
              ),
            ),
          );
        });

        test('it is a participation to share for a profiles collection campaign', async function (assert) {
          this.set('campaign.type', 'PROFILES_COLLECTION');
          this.set('participation.status', 'TO_SHARE');

          const screen = await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);

          assert.ok(
            screen.getByText(
              this.intl.t(
                'pages.campaign-activity.delete-participation-modal.warning.profiles-collection-campaign-participation.to-share-participation',
              ),
            ),
          );
        });

        test('it is a shared participation for a profiles collection campaign', async function (assert) {
          this.set('campaign.type', 'PROFILES_COLLECTION');
          this.set('participation.status', 'SHARED');

          const screen = await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
/>`);

          assert.ok(
            screen.getByText(
              this.intl.t(
                'pages.campaign-activity.delete-participation-modal.warning.profiles-collection-campaign-participation.shared-participation',
              ),
            ),
          );
        });
      });
    });
  });
});
