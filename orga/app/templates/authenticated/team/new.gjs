import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import InviteForm from 'pix-orga/components/team/invite-form';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle (t "pages.team-list.title")}}
  {{pageTitle (t "pages.team-new.title")}}

  <div class="new-team-page">
    <PageTitle>
      <:title>{{t "pages.team-new.title"}}</:title>
    </PageTitle>

    <PixNotificationAlert @type="warning" class="new-team-page__warning-banner" @withIcon={{true}}>{{t
        "pages.team-new.warning"
      }}</PixNotificationAlert>

    <p class="paragraph">
      {{t "pages.team-new.email-requirement"}}<br />
      {{t "pages.team-new.several-email-requirement"}}
    </p>

    <p class="paragraph">
      {{t "pages.team-new.invited-members"}}
    </p>

    <InviteForm
      @email={{@model.email}}
      @isLoading={{@controller.isLoading}}
      @onSubmit={{@controller.createOrganizationInvitation}}
      @onCancel={{@controller.cancel}}
      @onUpdateEmail={{@controller.updateEmail}}
      class="new-team-page__form"
    />
  </div>
</template>
