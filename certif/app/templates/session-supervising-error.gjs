import { PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';

<template>
  {{pageTitle (t 'pages.session-supervising-error.page-title')}}

  <div class='session-supervising-error-page'>
    <div class='session-supervising-error-page__panel'>
      {{! template-lint-disable no-redundant-role }}
      <img src='/images/invigilator_no-access.svg' alt role='presentation' />
      <h1 class='session-supervising-error-page__panel__title'>{{t 'pages.session-supervising-error.title'}}</h1>
      <p class='session-supervising-error-page__panel__subtitle'>
        {{t 'pages.session-supervising-error.description'}}
      </p>

      <PixButtonLink @route='login-session-invigilator' class='session-supervising-error-page__panel__button'>
        {{t 'pages.session-supervising.login.form.sub-title'}}
      </PixButtonLink>
    </div>
  </div>
</template>
