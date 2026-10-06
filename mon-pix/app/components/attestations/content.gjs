import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import deburr from 'lodash/deburr';
import kebabCase from 'lodash/kebabCase';
import { ATTESTATION_DOWNLOAD_ORIGINS, EVENT_NAMES } from 'mon-pix/constants/metrics-events';

import UiPageTitle from '../ui/page-title';
import AttestationCard from './card';

export default class AttestationContent extends Component {
  @service session;
  @service fileSaver;
  @service pixMetrics;
  @service intl;

  @action
  async onClick(attestationDetail) {
    const { access_token: token, user_id: userId } = this.session.data.authenticated;
    this.pixMetrics.trackEvent(EVENT_NAMES.ATTESTATION.DOWNLOAD_CLICK, {
      origin: ATTESTATION_DOWNLOAD_ORIGINS.ATTESTATIONS_PAGE,
    });
    const url = `/api/users/${userId}/attestations/${attestationDetail.key}`;
    const fileName = 'attestation-' + kebabCase(deburr(attestationDetail.label));

    await this.fileSaver.save({ url, token, fileName });
  }

  <template>
    <main id="main" class="global-page-container" role="main">
      <UiPageTitle>
        <:title>{{t "pages.attestations.title"}}</:title>
        <:subtitle>{{t "pages.attestations.subtitle"}}</:subtitle>
      </UiPageTitle>

      <ul class="attestation-list">
        {{#each @attestationsDetails as |attestationDetail|}}
          <li>
            <AttestationCard
              @attestationDetail={{attestationDetail}}
              @downloadAttestation={{fn this.onClick attestationDetail}}
            />
          </li>
        {{/each}}
      </ul>
    </main>
  </template>
}
