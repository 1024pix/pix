import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import UserCertificationsDetailCompetencesList from '../user-certifications-detail-competences-list';
import UserCertificationsDetailHeader from '../user-certifications-detail-header';
import UserCertificationsDetailResult from '../user-certifications-detail-result';

export default class v2CertificationShared extends Component {
  get shouldDisplayDetailsSection() {
    const model = this.args.model;
    return Boolean(model.commentForCandidate || model.hasAcquiredComplementaryCertifications);
  }

  <template>
    <PixButtonLink
      @route="fill-in-certificate-verification-code"
      @iconBefore="arrowLeft"
      @variant="tertiary"
      class="user-certifications-page__previous-button"
    >
      {{t "pages.shared-certification.back-link"}}
    </PixButtonLink>

    <PixBlock class="user-certifications-page-get__header">
      <UserCertificationsDetailHeader @certification={{@model}} />
    </PixBlock>

    <div class="user-certifications-page-get__details-body">
      <UserCertificationsDetailCompetencesList
        @resultCompetenceTree={{@model.resultCompetenceTree}}
        @maxReachableLevelOnCertificationDate={{@model.maxReachableLevelOnCertificationDate}}
      />
      {{#if this.shouldDisplayDetailsSection}}
        <UserCertificationsDetailResult @certification={{@model}} />
      {{/if}}
    </div>
  </template>
}
