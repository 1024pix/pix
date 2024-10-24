import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { t } from 'ember-intl';

<template>
  <section class="campaign-presentation-step campaign-presentation-step--badges">
    <div class="campaign-presentation-step__content">
      <div>
        <h1 class="campaign-presentation-step__title">
          {{t "pages.campaign.presentation.steps.badges.title"}}
        </h1>
        <ul class="campaign-presentation-step__list">
          {{#each @badges as |badge|}}
            <li>
              <img src={{badge.imageUrl}} alt={{badge.altMessage}} />
              <span>{{badge.title}}</span>
              {{#if badge.isCertifiable}}
                <PixTag @color="success">
                  {{t "pages.skill-review.badge-card.certifiable"}}
                </PixTag>
              {{/if}}
            </li>
          {{/each}}
        </ul>
        <PixButton class="campaign-presentation-step__next-button" @triggerAction={{@goToNextStep}} @size="large">
          {{t "common.actions.continue"}}
        </PixButton>
      </div>
      <img
        class="campaign-presentation-step__illustration"
        src="/images/illustrations/campaigns/presentation/step-badges.svg"
        alt=""
      />
    </div>
  </section>
</template>
