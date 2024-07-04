import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { t } from 'ember-intl';

import PageEn from './page-en';
import PageFr from './page-fr';

<template>
  <div class='terms-of-service-page'>
    <div class='terms-of-service-form'>

      <header class='terms-of-service-form__header'>
        <img src='/pix-certif-logo.svg' alt='Pix Certif' class='terms-of-service-form__header--logo' />

        <h1 class='terms-of-service-form__header--title pix-title-m'>
          {{t 'pages.terms-of-service.title'}}
        </h1>
      </header>

      <hr class='terms-of-service-form__line' />

      <main class='terms-of-service-form__text' tabindex='0'>
        {{#if @isEnglishLocale}}
          <PageEn />
        {{else}}
          <PageFr />
        {{/if}}
      </main>

      <footer>
        <ul class='terms-of-service-form__actions'>
          <li>
            <PixButtonLink @route='logout' @variant='secondary' @isBorderVisible='true'>
              {{t 'common.actions.cancel'}}
            </PixButtonLink>
          </li>
          <li>
            <PixButton @triggerAction={{@onSubmit}}>{{t 'pages.terms-of-service.actions.accept'}}</PixButton>
          </li>
        </ul>
      </footer>
    </div>
  </div>
</template>
