import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import deburr from 'lodash/deburr';
import kebabCase from 'lodash/kebabCase';

export default class AttestationResult extends Component {
  @service session;
  @service fileSaver;
  @service pixMetrics;
  @service intl;

  get result() {
    return this.args.results[0];
  }

  @action async onClick() {
    const { access_token: token, user_id: userId } = this.session.data.authenticated;
    this.sendMetrics();
    const url = `/api/users/${userId}/attestations/${this.result.reward.key}`;
    const fileName = 'attestation-' + kebabCase(deburr(this.result.reward.label));

    try {
      await this.fileSaver.save({ url, token, fileName });
    } catch {
      this.args.onError();
    }
  }

  sendMetrics() {
    this.pixMetrics.trackEvent('Clic sur le bouton Télécharger (attestation)', {
      disabled: true,
      category: 'Fin de parcours',
      action: 'Cliquer sur le bouton Télécharger (attestation)',
    });
  }

  <template>
    <div class="attestation-result">
      {{#if (eq this.result.obtained true)}}
        <p class="attestation-result__message attestation-result__message--obtained">
          <PixIcon @name="checkCircle" @plainIcon="{{true}}" />
          <span>
            {{t "components.campaigns.attestation-result.obtained"}}
          </span>
        </p>
        <span class="attestation-result__title">
          {{this.result.reward.label}}
        </span>
        <img
          class="attestation-result__illustration"
          alt=""
          src="/images/illustrations/results/attestation-obtained.svg"
        />
        <PixButton
          @variant="tertiary"
          @loadingColor="grey"
          class="attestation-result__download"
          @triggerAction={{this.onClick}}
        >
          {{t "common.actions.download"}}
          <PixIcon @name="download" />
        </PixButton>
      {{else if (eq this.result.obtained false)}}
        <p class="attestation-result__message attestation-result__message--not-obtained">
          <PixIcon @name="cancel" @plainIcon="{{true}}" />
          <span>
            {{t "components.campaigns.attestation-result.not-obtained" htmlSafe=true}}
          </span>
        </p>
        <span class="attestation-result__title">
          {{this.result.reward.label}}
        </span>
      {{else if (eq this.result.obtained null)}}
        <img
          class="attestation-result__illustration"
          alt=""
          src="/images/illustrations/results/attestation-computing.svg"
        />
        <p class="attestation-result__message attestation-result__message--computing">
          <PixIcon @name="error" @plainIcon="{{true}}" />
          <span>
            {{t "components.campaigns.attestation-result.computing"}}
          </span>
        </p>
        <p class="attestation-result__description">
          {{t "components.campaigns.attestation-result.computing-description"}}
        </p>
      {{/if}}
    </div>
  </template>
}
