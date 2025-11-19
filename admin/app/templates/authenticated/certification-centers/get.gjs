import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
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
      @availableHabilitations={{@controller.model.habilitations}}
      @certificationCenter={{@controller.model.certificationCenter}}
      @updateCertificationCenter={{@controller.updateCertificationCenter}}
      @refreshModel={{@controller.refresh}}
    />

    {{#unless @controller.model.certificationCenter.isArchived}}
      <PixTabs @variant="primary" @ariaLabel="Navigation de la section centre de certification" class="navigation">
        <LinkTo @route="authenticated.certification-centers.get.team">
          Équipe
        </LinkTo>

        <LinkTo @route="authenticated.certification-centers.get.invitations">
          Invitations
        </LinkTo>
      </PixTabs>
    {{/unless}}

    {{outlet}}
  </main>
</template>
