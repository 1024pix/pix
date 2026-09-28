import { PixCheckbox } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import ListItems from 'pix-admin/components/with-required-action-sessions/list-items';
<template>
  {{pageTitle "Sessions à traiter"}}

  {{#if @controller.hasSessionsToProcess}}
    <div class="session-list__assigned-to-process-session">
      <PixCheckbox
        @checked={{@controller.assignedToSelfOnly}}
        {{on "change" @controller.toggleAssignedSessionsDisplay}}
      >
        <:label>{{t "pages.sessions.table.required-actions.checkbox-label"}}</:label>
      </PixCheckbox>
    </div>
  {{/if}}

  <ListItems @withRequiredActionSessions={{@controller.sessionsList}} />
</template>
