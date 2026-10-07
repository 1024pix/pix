import { PixBlock, PixButtonLink } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CertificationEligibility extends Component {
  @service currentUser;

  get certifiableCompetencesCount() {
    if (this.args.userEligibility.isCertifiable) {
      return this.args.userEligibility.minimumCertifiableCompetencesForCertificability;
    }
    return this.args.userEligibility.certifiableCompetencesCount;
  }

  <template>
    <section>
      <section class="certification-dashboard-eligibility-steps">
        <PixBlock class="certification-dashboard-eligibility-steps__step-1">
          <div aria-hidden="true" class="certification-dashboard-eligibility-steps__step-1-progress">
            <p>
              <span>
                {{t
                  "pages.certification-dashboard.eligibility.steps.1.progress.counter"
                  certifiableCompetencesCount=this.certifiableCompetencesCount
                  minimumCertifiableCompetencesForCertificability=@userEligibility.minimumCertifiableCompetencesForCertificability
                }}
              </span>
            </p>
          </div>
          <h3>{{t "pages.certification-dashboard.eligibility.steps.1.title"}}</h3>
          <p class="sr-only">{{t
              "pages.certification-dashboard.eligibility.steps.1.progress.alt"
              certifiableCompetencesCount=this.certifiableCompetencesCount
              minimumCertifiableCompetencesForCertificability=@userEligibility.minimumCertifiableCompetencesForCertificability
            }}</p>
          <p>{{t "pages.certification-dashboard.eligibility.steps.1.description"}}</p>
          <PixButtonLink @route="authenticated.profile" @variant="tertiary">
            {{t "pages.certification-dashboard.eligibility.steps.1.link"}}
          </PixButtonLink>
        </PixBlock>
        <PixBlock class="certification-dashboard-eligibility-steps__step-2">
          <img src="/images/illustrations/certification-dashboard/block-note.png" alt="" />
          <h3>{{t "pages.certification-dashboard.eligibility.steps.2.title"}}</h3>
          <p>{{t "pages.certification-dashboard.eligibility.steps.2.description"}}</p>
        </PixBlock>
        <PixBlock class="certification-dashboard-eligibility-steps__step-3">
          <img src="/images/illustrations/certification-dashboard/block-note.png" alt="" />
          <h3>{{t "pages.certification-dashboard.eligibility.steps.3.title"}}</h3>
          <p>{{t "pages.certification-dashboard.eligibility.steps.3.description"}}</p>
        </PixBlock>
      </section>
    </section>
  </template>
}
