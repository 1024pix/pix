import { clickByName, render } from '@1024pix/ember-testing-library';
import DeleteParticipationModal from 'pix-orga/components/campaign/activity/delete-participation-modal';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::DeleteParticipationModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#deleteParticipation', function () {
    module('when the user click to delete the campaign participation', function () {
      const deleteCampaignParticipation = sinon.stub();
      const closeModal = sinon.stub();

      const campaign = { id: '90', externalIdLabel: 'id', type: 'ASSESSMENT' };
      const participation = {
        id: '56',
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'STARTED',
        participantExternalId: 'patate',
      };

      test('it displays the modal to confirm the deletion', async function (assert) {
        const screen = await render(
          <template>
            <DeleteParticipationModal
              @campaign={{campaign}}
              @participation={{participation}}
              @isModalOpen={{true}}
              @closeModal={{closeModal}}
              @deleteCampaignParticipation={{deleteCampaignParticipation}}
            />
          </template>,
        );

        assert.ok(screen.getByRole('heading', { name: 'Supprimer la participation de Joe La frite ?' }));
        assert.ok(screen.getByText(t('pages.campaign-activity.delete-participation-modal.text')));
        assert.ok(screen.getByText(t('pages.campaign-activity.delete-participation-modal.actions.cancel')));
        assert.ok(
          screen.getByRole('button', {
            name: t('pages.campaign-activity.delete-participation-modal.actions.confirmation'),
          }),
        );
      });

      module('When the user clicks on cancel button', function () {
        test('it closes the modal and not delete the campaign participation', async function (assert) {
          await render(
            <template>
              <DeleteParticipationModal
                @campaign={{campaign}}
                @participation={{participation}}
                @isModalOpen={{true}}
                @closeModal={{closeModal}}
                @deleteCampaignParticipation={{deleteCampaignParticipation}}
              />
            </template>,
          );

          await clickByName(t('pages.campaign-activity.delete-participation-modal.actions.cancel'));

          assert.ok(closeModal.calledOnce);
        });
      });

      module('When the user clicks on confirmation button', function () {
        test('it deletes the campaign participation', async function (assert) {
          await render(
            <template>
              <DeleteParticipationModal
                @campaign={{campaign}}
                @participation={{participation}}
                @isModalOpen={{true}}
                @closeModal={{closeModal}}
                @deleteCampaignParticipation={{deleteCampaignParticipation}}
              />
            </template>,
          );
          await clickByName(t('pages.campaign-activity.delete-participation-modal.actions.confirmation'));

          assert.ok(deleteCampaignParticipation.called);
        });
      });

      module('When the warning is different according to the campaign type and the participation status', function () {
        test('it is a started participation for an assessment campaign', async function (assert) {
          const campaign = { id: '90', externalIdLabel: 'id', type: 'ASSESSMENT' };
          const participation = {
            id: '56',
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'STARTED',
            participantExternalId: 'patate',
          };

          const screen = await render(
            <template>
              <DeleteParticipationModal
                @campaign={{campaign}}
                @participation={{participation}}
                @isModalOpen={{true}}
                @closeModal={{closeModal}}
                @deleteCampaignParticipation={{deleteCampaignParticipation}}
              />
            </template>,
          );

          assert.ok(
            screen.getByText(
              t(
                'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.started-participation',
              ),
            ),
          );
        });

        test('it is a shared participation for an assessment campaign', async function (assert) {
          const campaign = { id: '90', externalIdLabel: 'id', type: 'ASSESSMENT' };
          const participation = {
            id: '56',
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'SHARED',
            participantExternalId: 'patate',
          };

          const screen = await render(
            <template>
              <DeleteParticipationModal
                @campaign={{campaign}}
                @participation={{participation}}
                @isModalOpen={{true}}
                @closeModal={{closeModal}}
                @deleteCampaignParticipation={{deleteCampaignParticipation}}
              />
            </template>,
          );

          assert.ok(
            screen.getByText(
              t(
                'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.shared-participation',
              ),
            ),
          );
        });

        test('it is a shared participation for a profiles collection campaign', async function (assert) {
          const campaign = { id: '90', externalIdLabel: 'id', type: 'PROFILES_COLLECTION' };
          const participation = {
            id: '56',
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'SHARED',
            participantExternalId: 'patate',
          };

          const screen = await render(
            <template>
              <DeleteParticipationModal
                @campaign={{campaign}}
                @participation={{participation}}
                @isModalOpen={{true}}
                @closeModal={{closeModal}}
                @deleteCampaignParticipation={{deleteCampaignParticipation}}
              />
            </template>,
          );

          assert.ok(
            screen.getByText(
              t(
                'pages.campaign-activity.delete-participation-modal.warning.profiles-collection-campaign-participation.shared-participation',
              ),
            ),
          );
        });
      });
    });
  });
});
