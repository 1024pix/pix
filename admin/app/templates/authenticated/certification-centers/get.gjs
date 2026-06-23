import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/certification-centers/breadcrumb';
import Information from 'pix-admin/components/certification-centers/information';
<template>
  {{pageTitle "Centre " @model.certificationCenter.id}}
  <header class="page-header">
    <Breadcrumb @currentPageLabel={{@model.certificationCenter.name}} />
  </header>

  <main class="page-body" id="certification-center-get-page">
    <Information
      @availableHabilitations={{@model.habilitations}}
      @certificationCenter={{@model.certificationCenter}}
      @updateCertificationCenter={{@controller.updateCertificationCenter}}
      @refreshModel={{@controller.refresh}}
    />

    {{#unless @model.certificationCenter.isArchived}}
      <PixTabs
        @variant="primary"
        @ariaLabel={{t "pages.certification-centers.get.navbar.aria-label"}}
        class="navigation"
      >
        <LinkTo @route="authenticated.certification-centers.get.team">
          {{t "pages.certification-centers.get.navbar.team"}}
          ({{@model.certificationCenter.certificationCenterMemberships.length}})
        </LinkTo>

        <LinkTo @route="authenticated.certification-centers.get.invitations">
          {{t "pages.certification-centers.get.navbar.invitations"}}
          ({{@model.certificationCenter.certificationCenterInvitations.length}})
        </LinkTo>

        <LinkTo @route="authenticated.certification-centers.get.attached-organizations">
          {{t "pages.certification-centers.get.navbar.attached-organizations"}}
        </LinkTo>
      </PixTabs>
    {{/unless}}

    {{outlet}}
  </main>
</template>
