import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';

<template>
  <section class="page-body certification-center-get-page">
    <h1 class="pix-title-m">{{@certificationCenter.name}}</h1>

    {{#if @certificationCenter.isArchived}}
      <PixNotificationAlert class="certification-center-information-display__archived-warning" @type="warning">
        {{t
          "pages.certification-centers.information-view.is-archived-warning"
          archivedAt=@certificationCenter.archivedAtFormatDate
          archivedBy=@certificationCenter.archivistFullName
        }}
      </PixNotificationAlert>
    {{/if}}

    <PixTabs @variant="primary" @ariaLabel={{t "pages.certification-centers.get.navbar.aria-label"}} class="navigation">
      <LinkTo @route="authenticated.certification-centers.get.details" @model={{@certificationCenter.id}}>
        {{t "pages.certification-centers.get.navbar.details"}}
      </LinkTo>

      {{#unless @certificationCenter.isArchived}}
        <LinkTo @route="authenticated.certification-centers.get.team" @model={{@certificationCenter.id}}>
          {{t "pages.certification-centers.get.navbar.team"}}
          ({{@certificationCenter.certificationCenterMemberships.length}})
        </LinkTo>

        <LinkTo @route="authenticated.certification-centers.get.invitations" @model={{@certificationCenter.id}}>
          {{t "pages.certification-centers.get.navbar.invitations"}}
          ({{@certificationCenter.certificationCenterInvitations.length}})
        </LinkTo>
      {{/unless}}

      <LinkTo
        @route="authenticated.certification-centers.get.attached-organizations"
        @model={{@certificationCenter.id}}
      >
        {{t "pages.certification-centers.get.navbar.attached-organizations"}}
      </LinkTo>
    </PixTabs>

    {{yield to="outlet"}}

  </section>
</template>
