import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

const getCompetenceIndexLabel = (label, index) => `${label} ${index}`;
const getTableName = (index, name) => `${index} - ${name}`;

export default class TargetProfileContent extends Component {
  get targetProfileCompetences() {
    return this.args.currentCourse.frameworks
      .flatMap((framework) => framework.hasMany('areas').value())
      .flatMap((area) => area.hasMany('competences').value())
      .sort((a, b) => a.index - b.index)
      .map((competence) => {
        return {
          name: competence.name,
          index: competence.index,
          tubes: competence.sortedThematics.flatMap((thematic) => thematic.sortedTubes),
        };
      });
  }

  <template>
    <div class="target-profile-detail">
      <div class="target-profile-detail__header">
        <h3 class="pix-title-xs">Profils Cibles</h3>
        <p class="pix-body-s target-profile-detail__description">
          Les profils cibles permettent de réaliser des évaluations personnalisées et progressive en fonction du niveau
          de chaque participant. (WIP Description temporaire)
        </p>
      </div>
      {{#each this.targetProfileCompetences as |competence|}}
        <div class="course-modal__competence">
          <div class="course-modal__competence__title">
            <p>{{getCompetenceIndexLabel "Compétence" competence.index}}</p>
            <h2>{{competence.name}}</h2>
          </div>
          <PixTable
            @condensed={{true}}
            @variant="orga"
            @caption={{getTableName competence.index competence.name}}
            @data={{competence.tubes}}
          >
            <:columns as |tube context|>
              <PixTableColumn @context={{context}} class="course-modal__competence__description__column">
                <:header>
                  {{t "pages.catalogue.modal.tube-name-and-description"}}
                </:header>
                <:cell>
                  <span class="course-modal__competence__description__title">
                    {{tube.practicalTitle}}
                  </span>
                  <span class="course-modal__competence__description__text">
                    {{tube.practicalDescription}}
                  </span>
                </:cell>
              </PixTableColumn>
              <PixTableColumn @context={{context}} class="course-modal__competence__level__column">
                <:header>
                  {{t "pages.catalogue.modal.max-level"}}
                </:header>
                <:cell>
                  <span class="course-modal__competence__level__data">
                    {{#if tube.maxLevel}}
                      {{tube.maxLevel}}
                    {{else}}
                      {{t "pages.catalogue.modal.tube-unavailable"}}
                    {{/if}}
                  </span>
                </:cell>
              </PixTableColumn>
            </:columns>
          </PixTable>
        </div>
      {{/each}}
    </div>
  </template>
}
