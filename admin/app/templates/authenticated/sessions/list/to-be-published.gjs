import PixButton from '@1024pix/pix-ui/components/pix-button';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import ConfirmPopup from 'pix-admin/components/confirm-popup';
import ListItems from 'pix-admin/components/to-be-published-sessions/list-items';
<template>
  {{pageTitle "Sessions à publier"}}

  {{#if @controller.hasSessionsToPublish}}
    <div class="session-to-be-publish__publish-all">
      <PixButton @triggerAction={{@controller.showConfirmModal}}>{{t
          "pages.sessions.table.to-be-published.button-label"
        }}</PixButton>
    </div>
  {{/if}}

  <ListItems @toBePublishedSessions={{@model}} @publishSession={{@controller.publishSession}} />

  <ConfirmPopup
    @message={{t "pages.sessions.table.to-be-published.modals.batch-publications" length=@model.length}}
    @confirm={{@controller.batchPublishSessions}}
    @cancel={{@controller.hideConfirmModal}}
    @show={{@controller.shouldShowModal}}
  />
</template>
