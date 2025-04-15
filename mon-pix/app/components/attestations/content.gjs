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
  @service currentUser;
  @service fileSaver;
  @service metrics;
  @service intl;

  get resultTitle() {
    return `components.campaigns.attestation-result.title.digital-awarness`;
  }

  @action
  async onClick(type) {
    const { access_token: token, user_id: userId } = this.session.data.authenticated;
    this.sendMetrics();
    const url = `/api/users/${userId}/attestations/${type}`;
    const fileName = kebabCase(deburr(this.intl.t(this.resultTitle)));

    await this.fileSaver.save({ url, token, fileName });
  }

  sendMetrics() {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Page Mes Attestations',
      'pix-event-action': 'Cliquer sur le bouton Télécharger (attestation)',
      'pix-event-name': 'Clic sur le bouton Télécharger (attestation)',
    });
  }

  <template>
    <main id="main" class="global-page-container" role="main">
      <UiPageTitle>
        <:title>{{t "pages.attestations.title"}}</:title>
        <:subtitle>{{t "pages.attestations.subtitle"}}</:subtitle>
      </UiPageTitle>

      <ul class="attestation-list">
        {{#each this.currentUser.attestationsDetails as |attestationDetail|}}
          <li><AttestationCard
              @type={{attestationDetail.type}}
              @obtainedAt={{attestationDetail.obtainedAt}}
              @downloadAttestation={{this.onClick}}
            /></li>
        {{/each}}
      </ul>
    </main>
  </template>
}
