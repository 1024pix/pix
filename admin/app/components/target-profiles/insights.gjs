import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';

import Badges from './badges';
import Stages from './stages';

<template>
  <section class="page-section insights">
    <section class="insights__section">
      <h2 class="insights-section__title">Badges</h2>
      <Badges @badges={{@targetProfile.badges}} />
      <div class="insights-section__button">
        <PixButtonLink
          @variant="secondary"
          @route="authenticated.target-profiles.target-profile.badges.new"
          @model={{@targetProfile.id}}
          @iconBefore="add"
        >
          Nouveau badge
        </PixButtonLink>
      </div>
    </section>

    <section class="insights__section">
      <h2 class="insights-section__title">Paliers</h2>

      {{#if @targetProfile.hasLinkedCampaign}}
        <PixBannerAlert
          @type={{this.type}}
          @actionLabel={{this.actionLabel}}
          @actionUrl={{this.actionUrl}}
          @canCloseBanner={{this.canCloseBanner}}
        >
          <p>Ce profil cible est associé à une campagne, vous ne pouvez donc pas :</p>
          <ul>
            <li>ajouter un nouveau palier</li>
            <li>supprimer un palier existant</li>
            <li>modifier les seuils ou niveaux des paliers existants</li>
          </ul>
        </PixBannerAlert>
      {{/if}}

      <Stages
        @hasLinkedCampaign={{@targetProfile.hasLinkedCampaign}}
        @imageUrl={{@targetProfile.imageUrl}}
        @targetProfileId={{@targetProfile.id}}
        @maxLevel={{@targetProfile.maxLevel}}
        @targetProfile={{@targetProfile}}
        @stageCollection={{@stageCollection}}
      />
    </section>

  </section>
</template>
