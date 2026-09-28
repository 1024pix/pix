import { PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import EligibleDoubleCertificationBanner from 'mon-pix/components/certification-banners/eligible-double-certification-banner';

export default class Index extends Component {
  @service url;

  <template>
    <div class="congratulations-banner">
      <p class="congratulations-banner__message">
        {{t "pages.certification-joiner.congratulation-banner.message" fullName=@fullName htmlSafe=true}}
      </p>
      {{#if @doubleCertification.isBadgeValid}}
        <EligibleDoubleCertificationBanner @doubleCertification={{@doubleCertification}} />
      {{/if}}
      <div class="congratulations-banner__links">
        <PixButtonLink
          @href={{this.url.certificationHowToUrl}}
          class="congratulations-banner-links__link"
          target="_blank"
          @variant="transparent-dark"
          rel="noopener noreferrer"
        >
          {{t "pages.certification-joiner.congratulation-banner.link.text"}}
          <PixIcon @name="openNew" @plainIcon={{true}} @title={{t "navigation.external-link-title"}} />
        </PixButtonLink>
        <PixButtonLink
          @route="authenticated.user-certifications"
          @variant="transparent-dark"
          class="congratulations-banner-links__link"
        >{{t "pages.certification-start.link-to-user-certification"}}
          <PixIcon @name="eye" @plainIcon={{true}} @ariaHidden={{true}} />
        </PixButtonLink>
      </div>
    </div>
  </template>
}
