import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import DetailsPageLayout from 'pix-admin/components/layout/details-page-layout';
import HeadInformation from 'pix-admin/components/organizations/head-information';

<template>
  <DetailsPageLayout
    @currentPageLabel={{@model.name}}
    @navigationAriaLabel={{t "pages.organization.navbar.aria-label"}}
  >

    <:headSection>
      <HeadInformation @organization={{@model}} />
    </:headSection>

    <:alert>
      {{#if @model.isArchived}}
        <PixNotificationAlert class="organization-information-section__archived-message" @type="warning">
          {{t
            "components.organizations.information-section-view.is-archived-warning"
            archivedAt=@model.archivedFormattedDate
            archivedBy=@model.archivistFullName
          }}
        </PixNotificationAlert>
      {{/if}}
    </:alert>

    <:navigationLinks>
      <LinkTo @route="authenticated.organizations.get.details" @model={{@model}}>
        {{t "pages.organization.navbar.details"}}
      </LinkTo>

      <LinkTo @route="authenticated.organizations.get.features" @model={{@model}}>
        {{t "pages.organization.navbar.features"}}
      </LinkTo>

      {{#unless @model.isArchived}}
        <LinkTo @route="authenticated.organizations.get.team" @model={{@model}}>
          {{t "pages.organization.navbar.team"}}
          ({{@model.organizationMemberships.length}})
        </LinkTo>

        <LinkTo @route="authenticated.organizations.get.invitations" @model={{@model}}>
          {{t "pages.organization.navbar.invitations"}}
          ({{@model.organizationInvitations.length}})
        </LinkTo>
      {{/unless}}

      <LinkTo @route="authenticated.organizations.get.target-profiles" @model={{@model}}>
        {{t "pages.organization.navbar.target-profiles"}}
        ({{@model.targetProfileSummaries.length}})
      </LinkTo>

      <LinkTo @route="authenticated.organizations.get.campaigns" @model={{@model}}>
        {{t "pages.organization.navbar.campaigns"}}
      </LinkTo>

      {{#if @model.isPlacesManagementEnabled}}
        <LinkTo @route="authenticated.organizations.get.places" @model={{@model}}>
          {{t "pages.organization.navbar.places"}}
        </LinkTo>
      {{/if}}

      {{#if @controller.accessControl.hasAccessToOrganizationActionsScope}}
        <LinkTo @route="authenticated.organizations.get.all-tags" @model={{@model}}>
          {{t "pages.organization.navbar.tags"}}
        </LinkTo>
      {{/if}}

      {{#if @controller.accessControl.currentUser.adminMember.isSuperAdmin}}
        {{#if @model.network.id}}
          <LinkTo @route="authenticated.organizations.get.network" @model={{@model}}>
            {{t "pages.organization.navbar.network" nbrOfChildren=@model.children.length}}
          </LinkTo>
        {{/if}}
      {{/if}}
    </:navigationLinks>

    <:outlet>
      {{outlet}}
    </:outlet>

  </DetailsPageLayout>
</template>
