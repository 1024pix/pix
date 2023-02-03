import sinon from 'sinon';
import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { t } from 'ember-intl/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::DeleteParticipationModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#deleteParticipation', function () {
    module('when the user click to delete the campaign participation', function (hooks) {
      let participation;
      let campaign;
      const deleteCampaignParticipant = sinon.stub();
      const closeModal = sinon.stub();

      hooks.beforeEach(async function () {
        campaign = { id: 90, idPixLabel: 'id', type: 'ASSESSMENT' };
        participation = {
          id: 56,
          firstName: 'Joe',
          lastName: 'La frite',
          status: 'TO_SHARE',
          participantExternalId: 'patate',
        };

        this.set('campaign', campaign);
        this.set('participation', participation);
        this.closeModal = closeModal;
        this.deleteCampaignParticipant = deleteCampaignParticipant;
        this.isModalOpen = true;

        await render(hbs`<Campaign::Activity::DeleteParticipationModal
  @campaign={{this.campaign}}
  @participation={{this.participation}}
  @isModalOpen={{this.isModalOpen}}
  @closeModal={{this.closeModal}}
  @deleteCampaignParticipant={{this.deleteCampaignParticipant}}
/>`);
      });

      test('it displays the modal to confirm the deletion', async function (assert) {
        assert.contains(t('pages.campaign-activity.delete-participation-modal.title'));
        assert.contains(t('pages.campaign-activity.delete-participation-modal.actions.cancel'));
        assert.contains(t('pages.campaign-activity.delete-participation-modal.actions.confirmation'));
      });

      module('When the user clicks on cancel button', function () {
        test('it closes the modal and not delete the campaign participation', async function (assert) {
          await clickByName(t('pages.campaign-activity.delete-participation-modal.actions.cancel'));

          assert.ok(closeModal.calledOnce);
        });
      });

      module('When the user clicks on confirmation button', function () {
        test('it deletes the campaign participation', async function (assert) {
          await clickByName(t('pages.campaign-activity.delete-participation-modal.actions.confirmation'));

          assert.ok(deleteCampaignParticipant.calledWith(campaign.id, participation));
        });
      });
    });
  });
});
