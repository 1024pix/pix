import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import deburr from 'lodash/deburr';
import kebabCase from 'lodash/kebabCase';

import UiPageTitle from '../ui/page-title';
import AttestationCard from './card';

export default class AttestationContent extends Component {
  @service session;
  @service fileSaver;
  @service pixMetrics;
  @service intl;

  getFilename(type) {
    return `components.campaigns.attestation-result.title.${type}`;
  }

  @action
  async onClick(type) {
    const { access_token: token, user_id: userId } = this.session.data.authenticated;
    this.sendMetrics();
    const url = `/api/users/${userId}/attestations/${type}`;
    const fileName = 'attestation-' + kebabCase(deburr(this.intl.t(this.getFilename(type))));

    await this.fileSaver.save({ url, token, fileName });
  }

  sendMetrics() {
    this.pixMetrics.trackEvent('Clic sur le bouton Télécharger (attestation)', {
      disabled: true,
      category: 'Page Mes Attestations',
      action: 'Cliquer sur le bouton Télécharger (attestation)',
    });
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
              @type={{attestationDetail.type}}
              @obtainedAt={{attestationDetail.obtainedAt}}
              @downloadAttestation={{this.onClick}}
            />
          </li>
        {{/each}}
      </ul>
    </main>
  </template>
}
