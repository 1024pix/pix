import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle (t "pages.team-list.title")}}

  <div class="list-team-page">
    <PageTitle>
      <:title>{{t "pages.team-list.title"}}</:title>
      <:tools>
        {{#if @controller.currentUser.isAdminInOrganization}}
          <PixButtonLink @route="authenticated.team.new">
            {{t "pages.team-list.add-member-button"}}
          </PixButtonLink>
        {{/if}}
      </:tools>
    </PageTitle>

    {{#if @controller.currentUser.isAdminInOrganization}}
      <PixTabs @variant="orga" class="list-team-page__tabs" @ariaLabel={{t "navigation.team-members.aria-label"}}>
        <LinkTo @route="authenticated.team.list.members">
          {{t "pages.team-list.tabs.member" count=@model.memberships.meta.rowCount}}
        </LinkTo>

        <LinkTo @route="authenticated.team.list.invitations">
          {{t "pages.team-list.tabs.invitation" count=@model.organization.organizationInvitations.length}}
        </LinkTo>
      </PixTabs>
    {{/if}}

    {{outlet}}
  </div>
</template>
