import { PixButton } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <section class="feedback-wrapper">
    <h2 class="screen-reader-only">{{t "components.challenge.feedback.common.title"}}</h2>
    {{#unless @isToggleFeedbackFormHidden}}
      <PixButton
        class="feedback-wrapper__open-close"
        @variant="tertiary"
        @iconBefore="flag"
        @plainIconBefore={{true}}
        @triggerAction={{@triggerAction}}
        @isDisabled={{@isDisabled}}
        aria-expanded={{@isAriaExpanded}}
      >
        {{t "components.challenge.feedback.common.actions.open-close"}}
      </PixButton>
    {{/unless}}

    {{yield to="form"}}
  </section>
</template>
