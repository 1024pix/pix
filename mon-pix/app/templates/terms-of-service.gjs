import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';

<template>
  {{pageTitle (t "pages.terms-of-service.title")}}
  <div class="terms-of-service-page">
    <div class="terms-of-service-form">

      {{#if @controller.isUpdateRequested}}
        <h1 class="pix-title-m">{{t "pages.terms-of-service.update-requested.title"}}</h1>
        <p class="pix-body-m">{{t "pages.terms-of-service.update-requested.message"}}</p>
      {{else}}
        <h1 class="pix-title-m">{{t "pages.terms-of-service.requested.title"}}</h1>
        <p class="pix-body-m">{{t "pages.terms-of-service.requested.message"}}</p>
      {{/if}}

      <div class="terms-of-service-acceptation__illustration">
        <img src="{{this.rootURL}}/images/terms-of-service.svg" alt="" role="none" />
        <a
          href={{@controller.legalDocumentUrl}}
          target="_blank"
          rel="noopener noreferrer"
          class="terms-of-service-form__link"
        >
          {{t "pages.terms-of-service.actions.document-link"}}
          <PixIcon @name="openNew" />
        </a>
      </div>

      <div class="terms-of-service-form__actions">
        <PixButtonLink @route="logout" @variant="secondary" @size="large">{{t
            "pages.terms-of-service.actions.decline"
          }}</PixButtonLink>

        <PixButton
          @type="submit"
          @triggerAction={{@controller.submit}}
          class="terms-of-service-form__accept-action"
          @size="large"
        >
          {{t "pages.terms-of-service.actions.accept"}}
        </PixButton>
      </div>
    </div>
  </div>
</template>
