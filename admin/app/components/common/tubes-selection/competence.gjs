import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixCollapsible from '@1024pix/pix-ui/components/pix-collapsible';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';

import Header from '../../table/header';
import Thematic from './thematic';
import Tube from './tube';

export default class Competence extends Component {
  @action
  onChange(event) {
    event.target.checked ? this.checkAllTubes() : this.uncheckAllTubes();
  }

  get competenceTubes() {
    const thematics = this.args.competence.hasMany('thematics').value();
    const tubes = thematics.map((thematic) => thematic.hasMany('tubes').value());
    return tubes.flat();
  }

  get selectedTubeIds() {
    return this.args.selectedTubeIds;
  }

  get isChecked() {
    return this.competenceTubes.some(({ id }) => this.selectedTubeIds.includes(id));
  }

  get isIndeterminate() {
    return this.competenceTubes.some(({ id }) => !this.selectedTubeIds.includes(id));
  }

  checkAllTubes() {
    this.competenceTubes.forEach((tube) => {
      this.args.checkTube(tube);
    });
  }

  uncheckAllTubes() {
    this.competenceTubes.forEach((tube) => {
      this.args.uncheckTube(tube);
    });
  }

  <template>
    <div class="competence-container">
      <PixCollapsible @title="{{@competence.index}} {{@competence.name}}">
        <div class="panel">
          <table class="table content-text content-text--small select-tube-table">
            <caption class="screen-reader-only">Sélection des sujets</caption>
            <thead>
              <tr>
                <Header @size="medium" scope="col">
                  <label>
                    <PixCheckbox
                      id="competence-{{@competence.id}}"
                      @checked={{this.isChecked}}
                      @isIndeterminate={{this.isIndeterminate}}
                      {{on "change" this.onChange}}
                    >
                      <:label>Thématiques</:label>
                    </PixCheckbox>
                  </label>
                </Header>
                <Header @size="wide" scope="col">
                  <p>Sujets</p>
                </Header>
                <Header @size="small" scope="col">
                  <p>Niveau</p>
                </Header>
                {{#if @displayDeviceCompatibility}}
                  <Header @size="medium" @align="center" scope="col">
                    <p>Compatibilité</p>
                  </Header>
                {{/if}}
              </tr>
            </thead>

            <tbody>
              {{#each @competence.sortedThematics as |thematic|}}
                {{#each thematic.tubes as |tube index|}}
                  <tr class={{if (eq index 0) "row-thematic"}} aria-label="Sujet">
                    {{#if (eq index 0)}}
                      <Thematic
                        @thematic={{thematic}}
                        @selectedTubeIds={{@selectedTubeIds}}
                        @checkTube={{@checkTube}}
                        @uncheckTube={{@uncheckTube}}
                      />
                    {{/if}}
                    <Tube
                      @tube={{tube}}
                      @setLevelTube={{@setLevelTube}}
                      @selectedTubeIds={{@selectedTubeIds}}
                      @checkTube={{@checkTube}}
                      @uncheckTube={{@uncheckTube}}
                      @tubeLevels={{@tubeLevels}}
                      @displayDeviceCompatibility={{@displayDeviceCompatibility}}
                      @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
                    />
                  </tr>
                {{/each}}
              {{/each}}
            </tbody>
          </table>
        </div>
      </PixCollapsible>
    </div>
  </template>
}
