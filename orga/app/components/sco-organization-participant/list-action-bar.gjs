import PixButton from '@1024pix/pix-ui/components/pix-button';
import { t } from 'ember-intl';

import ActionBar from '../ui/action-bar';

<template>
  <ActionBar>
    <:information>
      {{t "pages.sco-organization-participants.action-bar.information" count=@count}}
    </:information>
    <:actions>
      {{#if @hasGarIdentityProvider}}
        <PixButton @triggerAction={{@openResetPasswordModal}}>
          {{t "pages.sco-organization-participants.action-bar.reset-password-button"}}
        </PixButton>
      {{else}}
        <PixButton @triggerAction={{@openGenerateUsernamePasswordModal}}>
          {{t "pages.sco-organization-participants.action-bar.generate-username-password-button"}}
        </PixButton>
      {{/if}}
    </:actions>
  </ActionBar>
</template>
