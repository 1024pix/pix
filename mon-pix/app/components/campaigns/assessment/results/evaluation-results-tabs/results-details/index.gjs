import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CompetenceRow from './competence-row';

export default class EvaluationResultsDetailsTab extends Component {
  get groupedCompetencesByArea() {
    return this.args.competenceResults.reduce((areas, competenceResult) => {
      const existingArea = areas.find((area) => area.areaTitle === competenceResult.areaTitle);

      if (existingArea) {
        existingArea.competences.push(competenceResult);
      } else {
        areas.push({
          areaTitle: competenceResult.areaTitle,
          areaColor: competenceResult.areaColor,
          competences: [competenceResult],
        });
      }
      return areas;
    }, []);
  }

  get total() {
    return this.args.totalStage - 1;
  }

  <template>
    <h2 class="evaluation-results-tab__title">{{t "pages.skill-review.tabs.results-details.title"}}</h2>
    <p class="evaluation-results-tab__description">{{t "pages.skill-review.tabs.results-details.description"}}</p>

    <ol class="evaluation-results-tab__areas">
      {{#each this.groupedCompetencesByArea as |area|}}
        <li class="evaluation-results-tab__area">
          <h3 class="evaluation-results-tab__area-title evaluation-results-tab__area-title--{{area.areaColor}}">
            {{area.areaTitle}}
          </h3>
          <table class="evaluation-results-tab__competences-table">
            <tbody>
              {{#each area.competences as |competence|}}
                <CompetenceRow @competence={{competence}} @total={{this.total}} />
              {{/each}}
            </tbody>
          </table>
        </li>
      {{/each}}
    </ol>
  </template>
}
