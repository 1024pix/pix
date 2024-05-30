import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { t } from 'ember-intl';

function deleteParticipationModalWarning(type, status) {
  return DELETE_PARTICIPATION_MODAL_WARNING[type][status];
}

<template>
  <PixModal
    @title={{t
      "pages.campaign-activity.delete-participation-modal.title"
      lastName=@participation.lastName
      firstName=@participation.firstName
      htmlSafe=true
    }}
    @onCloseButtonClick={{@closeModal}}
    @showModal={{@isModalOpen}}
  >
    <:content>
      <p>
        {{t "pages.campaign-activity.delete-participation-modal.text"}}
      </p>
      <p class="warning-text">
        {{#if @participation}}
          {{t (deleteParticipationModalWarning @campaign.type @participation.status)}}
        {{/if}}
      </p>
    </:content>
    <:footer>
      <PixButton @variant="secondary" @triggerAction={{@closeModal}}>
        {{t "pages.campaign-activity.delete-participation-modal.actions.cancel"}}
      </PixButton>
      <PixButton @variant="error" @triggerAction={{@deleteCampaignParticipation}}>
        {{t "pages.campaign-activity.delete-participation-modal.actions.confirmation"}}
      </PixButton>
    </:footer>
  </PixModal>
</template>

const DELETE_PARTICIPATION_MODAL_WARNING = {
  ASSESSMENT: {
    STARTED:
      'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.started-participation',
    TO_SHARE:
      'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.to-share-participation',
    SHARED:
      'pages.campaign-activity.delete-participation-modal.warning.assessment-campaign-participation.shared-participation',
  },
  PROFILES_COLLECTION: {
    TO_SHARE:
      'pages.campaign-activity.delete-participation-modal.warning.profiles-collection-campaign-participation.to-share-participation',
    SHARED:
      'pages.campaign-activity.delete-participation-modal.warning.profiles-collection-campaign-participation.shared-participation',
  },
};
