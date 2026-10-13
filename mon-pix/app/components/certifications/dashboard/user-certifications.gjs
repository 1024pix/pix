import { PixButtonLink } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ListItem from 'mon-pix/components/user-certifications/list-item';

export default class UserCertifications extends Component {
  @service url;

  get certificationsSummariesSortedByDate() {
    return [...this.args.certificationsSummaries].sort((a, b) => {
      return b.certificationStartedAt - a.certificationStartedAt;
    });
  }

  <template>
    <section class="certification-dashboard-user-certifications">
      <h2 class="certification-dashboard-user-certifications__title">
        <img src="/images/illustrations/certification-hat.png" alt="" />
        {{t "pages.certifications-dashboard.user-certifications.title"}}
      </h2>
      {{#if this.certificationsSummariesSortedByDate.length}}
        <p class="certification-dashboard-user-certifications__text">
          {{t "pages.certifications-dashboard.user-certifications.with-certification-text"}}
        </p>
        <ol class="certification-dashboard-user-certifications__list">
          {{#each this.certificationsSummariesSortedByDate as |certificateSummary|}}
            <li>
              <ListItem
                data-testid="pw-certification-card-{{certificateSummary.id}}"
                @certificateSummary={{certificateSummary}}
              />
            </li>
          {{/each}}
        </ol>
      {{else}}
        <p class="certification-dashboard-user-certifications__text">
          {{t "pages.certifications-dashboard.user-certifications.without-certification-text"}}
        </p>
        <div class="certification-dashboard-user-certifications__how-to-certificate">
          <p class="certification-dashboard-user-certifications__how-to-certificate-text">
            {{t "pages.certifications-dashboard.user-certifications.how-to-certificate.text"}}
          </p>
          <PixButtonLink
            class="certification-dashboard-user-certifications__how-to-certificate-link"
            @href={{this.url.certificationHowToUrl}}
            @iconAfter="openNew"
            @variant="tertiary"
            target="_blank"
            rel="noopener"
          >
            {{t "pages.certifications-dashboard.user-certifications.how-to-certificate.link"}}
            <span class="sr-only">&nbsp;{{t "common.a11y.external-link"}}</span>
          </PixButtonLink>
        </div>
      {{/if}}
    </section>
  </template>
}
