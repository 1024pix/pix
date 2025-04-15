import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle (t "pages.certifications.title")}}

  <div class="certifications-page">
    <PageTitle>
      <:title>
        {{t "pages.certifications.title"}}
      </:title>
    </PageTitle>
    {{#if @controller.hasDivisions}}
      <p class="certifications-page__text">
        {{t "pages.certifications.description" htmlSafe=true}}
      </p>

      <form class="certifications-page__action" {{on "submit" @controller.downloadSessionResultFile}}>
        <PixSelect
          @options={{@model.options}}
          @value={{@controller.selectedDivision}}
          @hideDefaultOption={{true}}
          @onChange={{@controller.onSelectDivision}}
          @isSearchable={{true}}
          @isValidationActive={{true}}
          @placeholder={{@controller.firstTwoDivisions}}
          required={{true}}
        >
          <:label>{{t "pages.certifications.select-label"}}</:label>
        </PixSelect>
        <PixButton @type="submit" id="download_results" @size="small">
          {{t "pages.certifications.download-button"}}
        </PixButton>
        <PixButton @triggerAction={{@controller.downloadAttestation}} id="download_attestations" @size="small">
          {{t "pages.certifications.download-attestations-button"}}
        </PixButton>
      </form>

      <PixNotificationAlert @withIcon={{true}}>
        {{t "pages.certifications.documentation-link-notice"}}
        <a
          class="link--underlined certifications-page-action__link"
          href={{t "pages.certifications.documentation-link"}}
          target="_blank"
          rel="noopener noreferrer"
        >
          {{t "pages.certifications.documentation-link-label"}}
          <PixIcon @name="openNew" @title={{t "navigation.external-link-title"}} />
        </a>
      </PixNotificationAlert>
    {{else}}
      <p class="certifications-page__text">
        {{t "pages.certifications.no-students-imported-yet" htmlSafe=true}}
      </p>
    {{/if}}
  </div>
</template>
