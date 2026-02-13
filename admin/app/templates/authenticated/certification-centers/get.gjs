import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import Breadcrumb from 'pix-admin/components/certification-centers/breadcrumb';
import DetailsPageLayout from 'pix-admin/components/layout/details-page-layout';

<template>
  <DetailsPageLayout @currentPageLabel={{@model.certificationCenter.name}} @navigationAriaLabel="Navigation">
    <:breadCrumb>
      <Breadcrumb @currentPageLabel={{@model.certificationCenter.name}} />
    </:breadCrumb>

    <:headSection>
      <h1 class="certification-center-information-display__name">{{@model.certificationCenter.name}}</h1>

    </:headSection>

    <:alert>
      {{#if @model.certificationCenter.isArchived}}
        <PixNotificationAlert class="certification-center-information-display__archived-warning" @type="warning">
          {{t
            "pages.certification-centers.information-view.is-archived-warning"
            archivedAt=@model.certificationCenter.archivedAtFormatDate
            archivedBy=@model.certificationCenter.archivistFullName
          }}
        </PixNotificationAlert>
      {{/if}}
    </:alert>

    <:navigationLinks>
      {{#unless @model.certificationCenter.isArchived}}
        <LinkTo @route="authenticated.certification-centers.get.details">
          {{t "pages.organization.navbar.details"}}
        </LinkTo>
        <LinkTo @route="authenticated.certification-centers.get.team">
          Équipe ({{@controller.model.certificationCenter.certificationCenterMemberships.length}})
        </LinkTo>

        <LinkTo @route="authenticated.certification-centers.get.invitations">
          Invitations
        </LinkTo>
      {{/unless}}
    </:navigationLinks>

    <:outlet>
      {{outlet}}
    </:outlet>
  </DetailsPageLayout>
</template>
