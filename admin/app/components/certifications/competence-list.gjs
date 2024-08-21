import { concat, fn, get } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import CertificationInfoField from './info-field';

export default class CertificationCompetenceList extends Component {
  competenceList = [
    '1.1',
    '1.2',
    '1.3',
    '2.1',
    '2.2',
    '2.3',
    '2.4',
    '3.1',
    '3.2',
    '3.3',
    '3.4',
    '4.1',
    '4.2',
    '4.3',
    '5.1',
    '5.2',
  ];

  get indexedValues() {
    const competences = this.args.competences;
    const indexedCompetences = competences.reduce((result, value) => {
      result[value.index] = value;
      return result;
    }, {});
    const competencesList = this.competenceList;
    const scores = [];
    const levels = [];
    let index = 0;
    competencesList.forEach((value) => {
      scores[index] = indexedCompetences[value] ? indexedCompetences[value].score : null;
      levels[index] = indexedCompetences[value] ? indexedCompetences[value].level : null;
      index++;
    });
    return {
      scores: scores,
      levels: levels,
    };
  }

  @action
  onScoreChange(index, event) {
    const list = this.competenceList;
    this.args.onUpdateScore(list[index], event.target.value);
  }

  @action
  onLevelChange(index, event) {
    const list = this.competenceList;
    this.args.onUpdateLevel(list[index], event.target.value);
  }

  <template>
    {{#if @edition}}
      {{#each this.competenceList as |competenceItem key|}}
        <div class="competence-list-edited" aria-label="Informations de la compétence {{competenceItem}} éditable">
          <CertificationInfoField
            @fieldId={{concat "certification-info-score_" key}}
            @value={{get this.indexedValues.scores key}}
            @edition={{@edition}}
            @label={{competenceItem}}
            @suffix="Pix"
            {{on "change" (fn this.onScoreChange key)}}
          />

          <CertificationInfoField
            @fieldId={{concat "certification-info-level_" key}}
            @value={{get this.indexedValues.levels key}}
            @edition={{@edition}}
            @label="Niveau:"
            {{on "change" (fn this.onLevelChange key)}}
          />
        </div>
      {{/each}}
    {{else}}
      <table aria-label="{{t 'pages.certifications.certification.result.table.label'}}" class="table-admin">
        <thead>
          <tr>
            <th scope="col">{{t "pages.certifications.certification.result.table.headers.competence"}}</th>
            {{#if @shouldDisplayPixScore}}
              <th scope="col">{{t "pages.certifications.certification.result.table.headers.score"}}</th>
            {{/if}}
            <th scope="col">{{t "pages.certifications.certification.result.table.headers.level"}}</th>
          </tr>
        </thead>
        <tbody>
          {{#each @competences as |competence|}}
            <tr>
              <th scope="row">{{competence.index}}</th>
              {{#if @shouldDisplayPixScore}}
                <td>{{competence.score}}</td>
              {{/if}}
              <td>{{competence.level}}</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    {{/if}}
  </template>
}
