import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CampaignCodeForm from 'mon-pix/components/campaign-code-form';

<template>
  {{pageTitle (t "pages.fill-in-campaign-code.title")}}

  <main id="main" class="main global-page-container" role="main">
    <CampaignCodeForm
      @isUserAuthenticatedByPix={{@controller.isUserAuthenticatedByPix}}
      @isUserAuthenticatedByGAR={{@controller.isUserAuthenticatedByGAR}}
      @startCampaign={{@controller.startCampaign}}
      @apiErrorMessage={{@controller.apiErrorMessage}}
      @clearErrors={{@controller.clearErrors}}
    />
  </main>

  <PixModal
    @title={{t "pages.fill-in-campaign-code.mediacentre-start-campaign-modal.title"}}
    @onCloseButtonClick={{@controller.closeModal}}
    @showModal={{@controller.showGARModal}}
  >
    <:content>
      <p>
        {{t "pages.fill-in-campaign-code.mediacentre-start-campaign-modal.message"}}
        <p class="pix-body-s">
          <div><b>{{@controller.name}}</b></div>
          {{t "pages.fill-in-campaign-code.mediacentre-start-campaign-modal.organised-by"}}
          <b>{{@controller.organizationName}}</b>
        </p>
        <p class="pix-body-s">
          <b>{{t "pages.fill-in-campaign-code.mediacentre-start-campaign-modal.message-footer"}}</b>
        </p>
      </p>
    </:content>

    <:footer>
      <div class="mediacentre-start-campaign-modal__action-buttons">
        <LinkTo
          class="mediacentre-start-campaign-modal-action-buttons__continue-action"
          @route={{@controller.routeToTransitionAfterGarModal}}
          @model={{@controller.verifiedCode.id}}
        >
          {{t "pages.fill-in-campaign-code.mediacentre-start-campaign-modal.actions.continue"}}
        </LinkTo>
        <PixButton @triggerAction={{@controller.closeModal}}>
          {{t "pages.fill-in-campaign-code.mediacentre-start-campaign-modal.actions.quit"}}
        </PixButton>
      </div>
    </:footer>
  </PixModal>
</template>
