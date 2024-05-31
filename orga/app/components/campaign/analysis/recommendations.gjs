import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

import TableHeader from '../../table/header';
import TableHeaderSort from '../../table/header-sort';
import TubeRecommendationRow from '../analysis/tube-recommendation-row';

export default class Recommendations extends Component {
  @service intl;
  @tracked sortedRecommendations;
  @tracked order;

  constructor() {
    super(...arguments);

    Promise.resolve(this.args.campaignTubeRecommendations).then((recommendations) => {
      this.sortedRecommendations = recommendations
        ? recommendations.slice().sort((a, b) => {
            return a.averageScore - b.averageScore;
          })
        : [];
    });
  }

  get description() {
    return htmlSafe(
      this.intl.t('pages.campaign-review.description', {
        bubble:
          '<span aria-hidden="true" focusable="false">(<svg height="10" width="10" role="img"><circle cx="5" cy="5" r="5" class="campaign-details-analysis recommendation-indicator__bubble" /></svg>)</span>',
      }),
    );
  }

  @action
  async sortRecommendationOrder(order) {
    this.order = order;
    const campaignTubeRecommendations = this.sortedRecommendations.slice();

    if (!this.sortedRecommendations) {
      return null;
    } else if (order === 'desc') {
      this.sortedRecommendations = campaignTubeRecommendations.sort((a, b) => {
        return a.averageScore - b.averageScore;
      });
    } else {
      this.sortedRecommendations = campaignTubeRecommendations.sort((a, b) => {
        return b.averageScore - a.averageScore;
      });
    }
  }
  <template>
    <section class="campaign-details-analysis-section">
      <h3 class="campaign-details-analysis campaign-details-analysis__header">{{t
          "pages.campaign-review.sub-title"
        }}</h3>
      <p class="campaign-details-analysis campaign-details-analysis__text">
        {{this.description}}
      </p>

      <table
        class="panel panel--light-shadow content-text content-text--small campaign-details-analysis__table"
        aria-label={{t "pages.campaign-review.table.analysis.title"}}
      >
        <caption class="screen-reader-only">{{t "pages.campaign-review.table.analysis.caption"}}</caption>
        <thead>
          <tr>
            <TableHeader @size="wide">{{t
                "pages.campaign-review.table.analysis.column.subjects"
                count=this.sortedRecommendations.length
              }}
            </TableHeader>
            <TableHeaderSort
              @size="small"
              @align="center"
              @order={{this.order}}
              @onSort={{this.sortRecommendationOrder}}
              @isDisabled={{not @displayAnalysis}}
              @ariaLabelDefaultSort={{t "pages.campaign-review.table.analysis.column.relevance.ariaLabelDefaultSort"}}
              @ariaLabelSortUp={{t "pages.campaign-review.table.analysis.column.relevance.ariaLabelSortUp"}}
              @ariaLabelSortDown={{t "pages.campaign-review.table.analysis.column.relevance.ariaLabelSortDown"}}
            >
              {{t "pages.campaign-review.table.analysis.column.relevance.label"}}
            </TableHeaderSort>
            <TableHeader
              @size="small"
              @align="center"
              aria-label="{{t 'pages.campaign-review.table.analysis.column.tutorial-count.aria-label'}}"
            />
            <TableHeader @size="small" />
          </tr>
        </thead>

        {{#if @displayAnalysis}}
          <tbody>
            {{#each this.sortedRecommendations as |tubeRecommendation|}}
              <TubeRecommendationRow @tubeRecommendation={{tubeRecommendation}} />
            {{/each}}
          </tbody>
        {{/if}}
      </table>
      {{#unless @displayAnalysis}}
        <div class="table__empty content-text">{{t "pages.campaign-review.table.empty"}}</div>
      {{/unless}}
    </section>
  </template>
}
