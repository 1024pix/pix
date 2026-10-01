import { PixBlock, PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';

<template>
  {{pageTitle (t "navigation.error")}}

  <main class="error-page">
    <PixBlock class="error-page__body-section">
      <div class="error-page__main-content">
        <h1 class="error-page__main-content__title">{{t "pages.error.first-title"}}</h1>
        {{t "pages.error.content-text" htmlSafe=true}}
        <PixButtonLink
          @route="authentication.login"
          @size="large"
          aria-label={{t "navigation.back-to-homepage"}}
          class="error-page__main-content__button-link"
        >
          {{t "navigation.back-to-homepage"}}
        </PixButtonLink>
      </div>
      <div class="error-page__error">
        <p class="error-page__error-title">{{@controller.errorTitle}}</p>
        <p>{{@controller.errorStatus}}</p>
        <p>{{@controller.errorDetail}}</p>
        <p>{{@controller.errorMessage}}</p>
      </div>
    </PixBlock>
  </main>
</template>
