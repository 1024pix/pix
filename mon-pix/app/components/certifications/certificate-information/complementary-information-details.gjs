import { PixBlock, PixIcon } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class ComplementaryInformationDetails extends Component {
  get shouldDisplayCommentForCandidateSection() {
    return Boolean(this.args.certificate.commentForCandidate);
  }

  get shouldDisplayComplementaryCertificationsSection() {
    return Boolean(this.args.certificate.hasAcquiredComplementaryCertifications);
  }

  <template>
    {{#if this.shouldDisplayCommentForCandidateSection}}
      <div>
        <h2>{{t "pages.certificate.jury-title"}}</h2>
        <PixBlock class="v2-comment-for-candidate-details">
          <p>
            {{@certificate.commentForCandidate}}
          </p>
          <p class="v2-comment-for-candidate-details__no-shareable-content">
            <PixIcon @name="info" @plainIcon={{true}} @ariaHidden={{true}} />
            {{t "pages.certificate.jury-info"}}
          </p>
        </PixBlock>
      </div>
    {{/if}}

    {{#if this.shouldDisplayComplementaryCertificationsSection}}
      <div>
        <h2>{{t "pages.certificate.complementary.title"}}</h2>
        <PixBlock>
          {{#each @certificate.certifiedBadgeImages as |certifiedBadgeImage|}}
            <div class="v2-complementary-certification-details-image">
              <img src={{certifiedBadgeImage.imageUrl}} alt="{{t 'pages.certificate.complementary.alternative'}}" />
              {{#if certifiedBadgeImage.message}}
                <span>{{certifiedBadgeImage.message}}</span>
              {{/if}}
            </div>
          {{/each}}
        </PixBlock>
      </div>
    {{/if}}
  </template>
}
