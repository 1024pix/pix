import { PixAccordions, PixButton, PixButtonLink } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

import { EVENT_NAME } from '../../helpers/metrics-event-name';
import Header from '../table/header';
import Thematic from './thematic';
import Tube from './tube';

export default class TubeList extends Component {
  @tracked selectedTubeLevels = new Map();
  @service pixMetrics;

  @action
  selectThematic(thematic) {
    thematic.tubes.forEach((tube) => {
      this.selectTube(tube);
    });
  }

  @action
  unselectThematic(thematic) {
    thematic.tubes.forEach((tube) => {
      this.unselectTube(tube);
    });
  }

  @action
  selectTube(tube) {
    this.selectedTubeLevels = this.selectedTubeLevels.set(tube.id, null);
  }

  @action
  unselectTube(tube) {
    this.selectedTubeLevels.delete(tube.id);
    this.selectedTubeLevels = new Map(this.selectedTubeLevels);
  }

  @action
  setTubeLevel(tubeId, level) {
    this.selectedTubeLevels = this.selectedTubeLevels.set(tubeId, parseInt(level));
  }

  getThematicState = (thematic) => {
    let every = true;
    let some = false;
    thematic.tubes.forEach((tube) => {
      if (this.isTubeSelected(tube)) {
        some = true;
      } else {
        every = false;
      }
    });
    return every ? 'checked' : some ? 'indeterminate' : 'unchecked';
  };

  isTubeSelected = (tube) => {
    return this.selectedTubeLevels.has(tube.id);
  };

  get haveNoTubeSelected() {
    return this.selectedTubeLevels.size === 0;
  }

  get numberOfTubesSelected() {
    return this.selectedTubeLevels.size;
  }

  get file() {
    const selectedTubes = this.args.frameworks.slice().flatMap((framework) => {
      return framework.sortedAreas.slice().flatMap((area) => {
        return area.sortedCompetences.slice().flatMap((competence) => {
          return competence.sortedThematics.slice().flatMap((thematic) => {
            return thematic.sortedTubes
              .filter((tube) => this.isTubeSelected(tube))
              .map((tube) => ({
                id: tube.id,
                frameworkId: framework.id,
                level: this.selectedTubeLevels.get(tube.id) ?? null,
              }));
          });
        });
      });
    });
    const json = JSON.stringify(selectedTubes);
    return new Blob([json], { type: 'application/json' });
  }

  get fileSize() {
    return (this.file.size / 1024).toFixed(2);
  }

  get formattedCurrentDate() {
    return new Date().toISOString().replace('T', '-').replaceAll(':', '').substring(0, 15);
  }

  get downloadURL() {
    return URL.createObjectURL(this.file);
  }

  @action
  trackDownloadClick() {
    this.pixMetrics.trackEvent(EVENT_NAME.TUBES_SELECTION.DOWNLOAD_JSON_CLICK);
  }

  <template>
    <section>
      <div class="download-file">
        {{#if this.haveNoTubeSelected}}
          <PixButton class="download-file__button" @isDisabled={{this.haveNoTubeSelected}}>
            {{t "pages.preselect-target-profile.no-tube-selected" fileSize=this.fileSize}}
          </PixButton>
        {{else}}
          <PixButtonLink
            class="download-file__button"
            @href={{this.downloadURL}}
            download={{t
              "pages.preselect-target-profile.download-filename"
              organizationName=@organization.name
              date=this.formattedCurrentDate
            }}
            {{on "click" this.trackDownloadClick}}
          >
            {{t
              "pages.preselect-target-profile.download"
              fileSize=this.fileSize
              numberOfTubesSelected=this.numberOfTubesSelected
            }}
          </PixButtonLink>
        {{/if}}
      </div>
      {{#each @frameworks as |framework|}}
        <section class="framework">
          <h2 class="framework__title">{{framework.name}}</h2>
          <div>
            {{#each framework.sortedAreas as |area|}}
              <PixAccordions class="{{area.color}}">
                <:title>{{area.code}} · {{area.title}}</:title>
                <:content>
                  {{#each area.sortedCompetences as |competence|}}
                    <h3>{{competence.index}} {{competence.name}}</h3>
                    <table class="table content-text content-text--small preselect-tube-table">
                      <caption>{{t "pages.preselect-target-profile.table.caption"}}</caption>
                      <thead>
                        <tr>
                          <Header @size="medium" scope="col">
                            {{t "pages.preselect-target-profile.table.column.theme-name"}}
                          </Header>
                          <Header @size="wide" scope="col">
                            {{t "pages.preselect-target-profile.table.column.name"}}
                          </Header>
                          <Header @size="medium" scope="col">
                            {{t "pages.preselect-target-profile.table.column.level"}}
                          </Header>
                          <Header @size="small" @align="center" scope="col">
                            {{t "pages.preselect-target-profile.table.column.compatibility"}}
                          </Header>
                        </tr>
                      </thead>

                      <tbody>
                        {{#each competence.sortedThematics as |thematic|}}
                          {{#each thematic.tubes as |tube index|}}
                            <tr class="row-tube" aria-label={{t "pages.preselect-target-profile.table.row-title"}}>
                              {{#if (eq index 0)}}
                                <Thematic
                                  @thematic={{thematic}}
                                  @getThematicState={{this.getThematicState}}
                                  @selectThematic={{this.selectThematic}}
                                  @unselectThematic={{this.unselectThematic}}
                                />
                              {{/if}}
                              <Tube
                                @tube={{tube}}
                                @selectedTubeLevels={{this.selectedTubeLevels}}
                                @isTubeSelected={{this.isTubeSelected}}
                                @selectTube={{this.selectTube}}
                                @unselectTube={{this.unselectTube}}
                                @setTubeLevel={{this.setTubeLevel}}
                              />
                            </tr>
                          {{/each}}
                        {{/each}}
                      </tbody>
                    </table>
                  {{/each}}
                </:content>
              </PixAccordions>
            {{/each}}
          </div>
        </section>
      {{/each}}
    </section>
  </template>
}
