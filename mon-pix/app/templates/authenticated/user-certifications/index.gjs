import { PixBlock } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import PageTitle from 'mon-pix/components/ui/page-title';
import ListItem from 'mon-pix/components/user-certifications/list-item';

export default class CertificationEnder extends Component {
  get certificateSummariesSortedByDate() {
    return (
      [...this.args.model].sort((a, b) => {
        return b.certificationStartedAt - a.certificationStartedAt;
      }) ?? []
    );
  }

  <template>
    <main id="main" role="main" class="global-page-container">
      <PageTitle>
        <:title>{{t "pages.certifications-list.title"}}</:title>
        <:subtitle>{{t "pages.certifications-list.description"}}</:subtitle>
      </PageTitle>

      {{#if this.certificateSummariesSortedByDate}}
        <ol class="user-certifications-list">
          {{#each this.certificateSummariesSortedByDate as |certificateSummary|}}
            <li>
              <ListItem
                data-testid="pw-certification-card-{{certificateSummary.id}}"
                @certificateSummary={{certificateSummary}}
              />
            </li>
          {{/each}}
        </ol>
      {{else}}
        <PixBlock>
          {{t "pages.certifications-list.no-certification.text"}}
        </PixBlock>
      {{/if}}
    </main>
  </template>
}
