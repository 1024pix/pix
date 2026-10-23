import { PixBlock, PixButtonLink } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

export default class CertificationEligibility extends Component {
  @service url;

  get isUserCertifiable() {
    return this.args.userIsCertifiable.isCertifiable;
  }

  get certifiableCompetencesCount() {
    const { certifiableCompetencesCount, minimumCertifiableCompetencesForCertificability } =
      this.args.userIsCertifiable;

    return this.isUserCertifiable ? minimumCertifiableCompetencesForCertificability : certifiableCompetencesCount;
  }

  <template>
    <section class="certification-dashboard-eligibility-steps">
      <h2 class="certification-dashboard-eligibility-steps__title">
        {{t "pages.certifications-dashboard.eligibility.steps.title"}}
      </h2>
      <div class="certification-dashboard-eligibility-steps__scroll-container">
        <PixBlock
          class="certification-dashboard-eligibility-steps__step-item certification-dashboard-eligibility-steps__step-item--active"
        >
          <div aria-hidden="true" class="certification-dashboard-eligibility-step-item__progress">
            <svg viewBox="-46 -46 92 60" fill="none" stroke-width="9" stroke-linecap="round" aria-hidden="true">
              <path stroke="#fff" d="M-40 9a41 41 0 1 1 80 0" />
              {{#if @userIsCertifiable.certifiableCompetencesCount}}
                <defs>
                  <linearGradient id="eligibility-gauge-gradient">
                    <stop offset="0" stop-color="#1b6b6a" />
                    <stop offset="1" stop-color="#38a09f" />
                  </linearGradient>
                </defs>
                <path
                  stroke="url(#eligibility-gauge-gradient)"
                  d="M-40 9a41 41 0 1 1 80 0"
                  pathLength={{@userIsCertifiable.minimumCertifiableCompetencesForCertificability}}
                  stroke-dasharray="{{this.certifiableCompetencesCount}} {{@userIsCertifiable.minimumCertifiableCompetencesForCertificability}}"
                />
              {{/if}}
            </svg>
            <p class="count">
              <b>
                {{t
                  "pages.certifications-dashboard.eligibility.steps.1.progress.counter"
                  certifiableCompetencesCount=this.certifiableCompetencesCount
                  minimumCertifiableCompetencesForCertificability=@userIsCertifiable.minimumCertifiableCompetencesForCertificability
                }}
              </b>
              {{t "pages.certifications-dashboard.eligibility.steps.1.progress.competences"}}
            </p>
          </div>
          <h3 class="certification-dashboard-eligibility-step-item__title">
            {{t "pages.certifications-dashboard.eligibility.steps.1.title"}}
          </h3>
          <p class="sr-only">
            {{t
              "pages.certifications-dashboard.eligibility.steps.1.progress.alt"
              certifiableCompetencesCount=this.certifiableCompetencesCount
              minimumCertifiableCompetencesForCertificability=@userIsCertifiable.minimumCertifiableCompetencesForCertificability
            }}
          </p>
          <p class="certification-dashboard-eligibility-step-item__text">
            {{t "pages.certifications-dashboard.eligibility.steps.1.description"}}
          </p>
          <PixButtonLink
            @route="authenticated.profile"
            @variant="tertiary"
            class="certification-dashboard-eligibility-step-item__link"
          >
            {{t "pages.certifications-dashboard.eligibility.steps.1.link"}}
          </PixButtonLink>
        </PixBlock>
        <PixBlock
          class="certification-dashboard-eligibility-steps__step-item
            {{if this.isUserCertifiable ' certification-dashboard-eligibility-steps__step-item--active' ''}}"
        >
          <img
            class="certification-dashboard-eligibility-step-item__image"
            src="/images/illustrations/certification-evaluation.png"
            alt=""
          />
          <h3 class="certification-dashboard-eligibility-step-item__title">
            {{t "pages.certifications-dashboard.eligibility.steps.2.title"}}
          </h3>
          <p class="certification-dashboard-eligibility-step-item__text">
            {{t "pages.certifications-dashboard.eligibility.steps.2.description"}}
          </p>
          <PixButtonLink
            @href={{this.url.certificationFindSession}}
            @variant="tertiary"
            target="_blank"
            rel="noopener noreferrer"
            class="certification-dashboard-eligibility-step-item__link"
            @isDisabled={{not this.isUserCertifiable}}
          >
            {{t "pages.certifications-dashboard.eligibility.steps.2.link"}}
          </PixButtonLink>
        </PixBlock>
        <PixBlock
          class="certification-dashboard-eligibility-steps__step-item
            {{if this.isUserCertifiable ' certification-dashboard-eligibility-steps__step-item--active' ''}}"
        >
          <img
            class="certification-dashboard-eligibility-step-item__image"
            src="/images/illustrations/certification-certificate.png"
            alt=""
          />
          <h3 class="certification-dashboard-eligibility-step-item__title">
            {{t "pages.certifications-dashboard.eligibility.steps.3.title"}}
          </h3>
          <p class="certification-dashboard-eligibility-step-item__text">
            {{t "pages.certifications-dashboard.eligibility.steps.3.description"}}
          </p>
        </PixBlock>
      </div>
    </section>
  </template>
}
