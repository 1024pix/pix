import PixCollapsible from '@1024pix/pix-ui/components/pix-collapsible';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';

import { isTubeSelected } from '../../../helpers/is-tube-selected';
import Header from '../../table/header';
import Checkbox from './checkbox';
import Thematic from './thematic';
import Tube from './tube';

export default class Competence extends Component {
  get state() {
    const checked = this.args.competence
      .hasMany('thematics')
      .value()
      .every((thematic) => this.isThematicSelected(thematic));
    if (checked) return 'checked';

    const indeterminate = this.args.competence
      .hasMany('thematics')
      .value()
      .any((thematic) => {
        return thematic
          .hasMany('tubes')
          .value()
          .any((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
      });

    if (indeterminate) return 'indeterminate';

    return 'unchecked';
  }

  isThematicSelected(thematic) {
    return thematic
      .hasMany('tubes')
      .value()
      .every((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
  }

  @action
  onChange(event) {
    if (event.target.checked) {
      this.check();
    } else {
      this.uncheck();
    }
  }

  check() {
    this.args.competence
      .hasMany('thematics')
      .value()
      .forEach((thematic) => {
        thematic
          .hasMany('tubes')
          .value()
          .forEach((tube) => {
            this.args.checkTube(tube);
          });
      });
  }

  uncheck() {
    this.args.competence
      .hasMany('thematics')
      .value()
      .forEach((thematic) => {
        thematic
          .hasMany('tubes')
          .value()
          .forEach((tube) => {
            this.args.uncheckTube(tube);
          });
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
                    <Checkbox id="competence-{{@competence.id}}" @state={{this.state}} {{on "change" this.onChange}} />
                    Thématiques
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
