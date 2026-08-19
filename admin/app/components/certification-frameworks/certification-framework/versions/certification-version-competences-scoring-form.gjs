import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

export default class CompetencesScoringForm extends Component {
  @tracked activeTab = 0;

  get sortedAreas() {
    return [...this.args.draftVersion.areas].sort((a, b) => Number(a.code) - Number(b.code));
  }

  get fakeLevels() {
    return [
      { competenceLevel: 0, bounds: { min: -8, max: -2 } },
      { competenceLevel: 1, bounds: { min: -2, max: -1 } },
      { competenceLevel: 2, bounds: { min: -1, max: 0.5 } },
      { competenceLevel: 3, bounds: { min: 0.5, max: 1 } },
      { competenceLevel: 4, bounds: { min: 1, max: 2 } },
      { competenceLevel: 5, bounds: { min: 2, max: 3 } },
      { competenceLevel: 6, bounds: { min: 3, max: 4 } },
      { competenceLevel: 7, bounds: { min: 4, max: 8 } },
    ];
  }

  @action
  isActiveTab(index) {
    return index === this.activeTab;
  }

  @action
  handleTabChange(index) {
    this.activeTab = index;
  }

  @action
  handleTabNavigation(event) {
    if (event.key === 'ArrowRight') {
      this.activeTab = (this.activeTab + 1) % this.sortedAreas.length;
    } else if (event.key === 'ArrowLeft') {
      this.activeTab = (this.activeTab - 1 + this.sortedAreas.length) % this.sortedAreas.length;
    }
  }

  <template>
    <Card
      class="versions-competences-scoring"
      @title={{t "components.certification-frameworks.certification-framework.versions.scoring.competences.title"}}
    >
      <PixBlock class="versions-competences-scoring__tabs" @variant="admin">
        <div class="versions-competences-scoring__tablist" role="tablist">
          {{#each this.sortedAreas as |area index|}}
            <button
              id="area-tab-{{index}}"
              class="versions-competences-scoring-tablist__tab"
              data-area-code={{area.code}}
              type="button"
              role="tab"
              aria-controls="area-{{index}}"
              aria-selected={{if (this.isActiveTab index) "true" ""}}
              tabindex={{if (this.isActiveTab index) 0 -1}}
              {{on "click" (fn this.handleTabChange index)}}
              {{on "keydown" this.handleTabNavigation}}
            >
              <span class="focus">{{area.code}} - {{area.title}}</span>
            </button>
          {{/each}}
        </div>
        <div>
          {{#each this.sortedAreas as |area index|}}
            <div
              id="area-{{index}}"
              role="tabpanel"
              aria-labelledby="area-tab-{{index}}"
              data-area-code={{area.code}}
              hidden={{if (this.isActiveTab index) "" "true"}}
            >
              <span class="versions-competences-scoring-tablist__title">{{area.code}} - {{area.title}}</span>
              <div class="versions-competences-scoring-tablist__competences-list">
                {{#each area.sortedCompetences as |competence|}}
                  <PixAccordions @isV2Version={{true}}>
                    <:title>{{competence.index}} - {{competence.name}}</:title>
                    <:content>
                      <PixTable @variant="modulix" @data={{this.fakeLevels}}>
                        <:columns as |level context|>
                          <PixTableColumn @context={{context}} class='table__column--wide'>
                            <:header>{{t
                              "components.certification-frameworks.certification-framework.versions.scoring.competences.level"
                            }}</:header>
                            <:cell>{{level.competenceLevel}}</:cell>
                          </PixTableColumn>
                          <PixTableColumn @context={{context}}>
                            <:header>{{t
                              "components.certification-frameworks.certification-framework.versions.scoring.minimum-input-label"
                            }}</:header>
                            <:cell>{{level.bounds.min}}</:cell>
                          </PixTableColumn>
                          <PixTableColumn @context={{context}}>
                            <:header>{{t
                              "components.certification-frameworks.certification-framework.versions.scoring.maximum-input-label"
                            }}</:header>
                            <:cell>{{level.bounds.max}}</:cell>
                          </PixTableColumn>
                        </:columns>
                      </PixTable>
                    </:content>
                  </PixAccordions>
                {{/each}}
              </div>
            </div>
          {{/each}}
        </div>
      </PixBlock>
    </Card>
  </template>
}
