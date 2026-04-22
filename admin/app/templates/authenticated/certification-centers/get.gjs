import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/certification-centers/breadcrumb';
import DetailPageLayout from 'pix-admin/components/layout/detail-page-layout';

<template>
  {{pageTitle "Centre " @model.certificationCenter.id}}
  <DetailPageLayout @navigationAriaLabel="Navigation de la section centre de certification">
    <:header>
      <Breadcrumb @currentPageLabel={{@model.certificationCenter.name}} />
      <h1 class="certification-center-information-display__name">{{@model.certificationCenter.name}}</h1>
    </:header>

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
      <LinkTo @route="authenticated.certification-centers.get.details">
        Détails
      </LinkTo>
      {{#unless @model.certificationCenter.isArchived}}
        <LinkTo @route="authenticated.certification-centers.get.team">
          Équipe ({{@model.certificationCenter.certificationCenterMemberships.length}})
        </LinkTo>

        <LinkTo @route="authenticated.certification-centers.get.invitations">
          Invitations
        </LinkTo>
      {{/unless}}

    </:navigationLinks>
    <:outlet>
      {{outlet}}
    </:outlet>
  </DetailPageLayout>
</template>
