import PixButton from '@1024pix/pix-ui/components/pix-button';
import { t } from 'ember-intl';

import MarkdownToHtml from '../../../markdown-to-html';

<template>
  <section class="campaign-presentation-step campaign-presentation-step--badges">
    <div class="campaign-presentation-step__content">
      <div class="campaign-presentation-step__content-left">
        <h1 class="campaign-presentation-step__title">
          {{t "pages.campaign.presentation.steps.organization.title"}}
        </h1>
        <MarkdownToHtml @markdown={{@customOrganizationText}} @isInline={{true}} />
        <PixButton class="campaign-presentation-step__next-button" @triggerAction={{@goToNextStep}} @size="large">
          {{t "common.actions.continue"}}
        </PixButton>
      </div>
      <img
        class="campaign-presentation-step__illustration"
        src="/images/illustrations/campaigns/presentation/step-organization.svg"
        alt=""
      />
    </div>
  </section>
</template>
