import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ListItem from 'mon-pix/components/user-certifications/list-item';

export default class UserCertifications extends Component {
  get certificationsSummariesSortedByDate() {
    return [...this.args.certificationsSummaries].sort((a, b) => {
      return b.certificationStartedAt - a.certificationStartedAt;
    });
  }

  <template>
    <section class="certification-dashboard-user-certifications">
      <h2 class="certification-dashboard-user-certifications__title">
        <img src="/images/illustrations/fat-bee.svg" />
        {{t "pages.certifications-dashboard.user-certifications.title"}}
      </h2>
      {{#if this.certificationsSummariesSortedByDate.length}}
        <p class="certification-dashboard-user-certifications__text">
          {{t "pages.certifications-dashboard.user-certifications.with-certification-text"}}
        </p>
        <ol class="user-certifications-list">
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
      {{/if}}
    </section>
  </template>
}
