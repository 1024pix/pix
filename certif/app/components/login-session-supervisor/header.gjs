import { t } from 'ember-intl';

<template>
  <header>
    <img src='/illu-espace-surveillant.svg' alt='' />
    <h1>{{t 'pages.session-supervising.login.form.title'}}</h1>
    <h2>{{t 'pages.session-supervising.login.form.sub-title'}}</h2>
    <p>{{t 'common.form-errors.mandatory-all-fields'}}</p>

    {{#if @errorMessage}}
      <p id='login-session-supervisor-form-error-message' class='error-message'>
        {{@errorMessage}}
      </p>
    {{/if}}
  </header>
</template>
