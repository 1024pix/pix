import { PixButtonLink } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CompetencesDetails from '../certificate-information/competences-details';
import ComplementaryInformationDetails from '../certificate-information/complementary-information-details';
import DownloadPdf from '../certificate-information/download-pdf';
import HeaderDetails from '../certificate-information/header-details';

export default class v2Certificate extends Component {
  get shouldDisplayComplementaryInformationSection() {
    const model = this.args.model;
    return Boolean(model.commentForCandidate || model.hasAcquiredComplementaryCertifications);
  }

  <template>
    <PixButtonLink
      @route="authenticated.user-certifications"
      @variant="tertiary"
      @iconBefore="arrowLeft"
      class="v2-candidate-certificate__previous-button"
    >
      {{t "pages.certificate.back-link"}}
    </PixButtonLink>

    <section class="v2-candidate-certificate">
      <div class="v2-candidate-certificate__information">
        <HeaderDetails @certificate={{@model}} />
        <DownloadPdf @certificate={{@model}} />
      </div>

      <section class="v2-candidate-certificate__complementary-information">
        <CompetencesDetails @certificate={{@model}} />

        {{#if this.shouldDisplayComplementaryInformationSection}}
          <div class="v2-candidate-certificate-complementary-information__details">
            <ComplementaryInformationDetails @certificate={{@model}} />
          </div>
        {{/if}}
      </section>

      <p class="v2-candidate-certificate__note">
        {{t
          "pages.certificate.competences.information"
          maxReachableLevelOnCertificationDate=@model.maxReachableLevelOnCertificationDate
          maxReachablePixCountOnCertificationDate=@model.maxReachablePixCountOnCertificationDate
        }}
      </p>
    </section>
  </template>
}
