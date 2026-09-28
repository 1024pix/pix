import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import LocaleSwitcher from 'mon-pix/components/locale-switcher';

<template>
  <div class="language">
    <LocaleSwitcher
      @label={{t "pages.user-account.language.lang"}}
      @onChange={{@controller.onLanguageChange}}
      @defaultValue={{@model.locale}}
    />

    {{#if @controller.shouldDisplayLanguageUpdatedMessage}}
      <PixNotificationAlert class="language__notification" @type="success" @withIcon={{true}}>
        {{t "pages.user-account.language.update-successful"}}
      </PixNotificationAlert>
    {{/if}}
  </div>
</template>
