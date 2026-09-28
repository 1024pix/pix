import { PixButtonLink } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CompetencesDetails from '../certificate-information/competences-details';
import ComplementaryInformationDetails from '../certificate-information/complementary-information-details';
import HeaderDetails from '../certificate-information/header-details';

export default class v2Certificate extends Component {
  get shouldDisplayComplementaryInformationSection() {
    const model = this.args.model;
    return Boolean(model.commentForCandidate || model.hasAcquiredComplementaryCertifications);
  }

  <template>
    <PixButtonLink
      @route="fill-in-certificate-verification-code"
      @iconBefore="arrowLeft"
      @variant="tertiary"
      class="v2-shareable-certificate__previous-button"
    >
      {{t "pages.shared-certification.back-link"}}
    </PixButtonLink>

    <section class="v2-shareable-certificate">
      <HeaderDetails @certificate={{@model}} />

      <section class="v2-shareable-certificate__complementary-information">
        <CompetencesDetails @certificate={{@model}} />
        {{#if this.shouldDisplayComplementaryInformationSection}}
          <div class="v2-shareable-certificate-complementary-information__details">
            <ComplementaryInformationDetails @certificate={{@model}} />
          </div>
        {{/if}}
      </section>
    </section>
  </template>
}
