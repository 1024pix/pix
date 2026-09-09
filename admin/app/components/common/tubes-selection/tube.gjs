import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const MAX_TUBE_LEVEL = 8;

export default class Tube extends Component {
  @tracked skillAvailabilityMap = [];

  constructor(...args) {
    super(...args);
    if (this.args.displaySkillDifficultyAvailability) {
      for (let i = 1; i <= MAX_TUBE_LEVEL; ++i) {
        const hasSkill = this.args.tube
          .hasMany('skills')
          .value()
          .find((skill) => skill.difficulty === i);
        this.skillAvailabilityMap.push({ difficulty: i, availability: hasSkill ? 'active' : 'missing' });
      }
    }
  }

  get levelOptions() {
    return Array.from({ length: this._maxLevel }, (_, index) => ({
      value: index + 1,
      label: `${index + 1}`,
    }));
  }

  get _maxLevel() {
    return this.args.tube.level;
  }

  get state() {
    return this.args.selectedTubeIds.includes(this.args.tube.id);
  }

  get selectedLevel() {
    return this.args.tubeLevels[this.args.tube.id] || null;
  }

  get checked() {
    return this.state === 'checked';
  }

  get mobileIcon() {
    return this.args.tube.mobile ? 'mobile' : 'mobileOff';
  }

  get tabletIcon() {
    return this.args.tube.tablet ? 'tablet' : 'tabletOff';
  }

  @action
  onChange(event) {
    if (event.target.checked) {
      this.args.checkTube(this.args.tube);
    } else {
      this.args.uncheckTube(this.args.tube);
      this.setLevelTube(null);
    }
  }

  @action
  setLevelTube(level) {
    const tubeId = this.args.tube.id;
    this.args.setLevelTube(tubeId, level);

    if (level) {
      this.args.checkTube(this.args.tube);
    }
  }

  <template>
    <td>
      <label>
        <PixCheckbox @id="tube-{{@tube.id}}" @checked={{this.state}} {{on "change" this.onChange}} @size="small">
          <:label>{{@tube.name}}&nbsp;: {{@tube.practicalTitle}}</:label>
        </PixCheckbox>
      </label>
    </td>
    <td class="table__column--center">
      <div class="level-selection">
        {{#if @displaySkillDifficultySelection}}
          <PixSelect
            @screenReaderOnly={{true}}
            @options={{this.levelOptions}}
            @value={{this.selectedLevel}}
            @onChange={{this.setLevelTube}}
            @texts={{hash placeholder="À sélectionner"}}
            @hideDefaultOption={{true}}
            class="tubes-selection__level-select"
          >
            <:label>Sélection du niveau du sujet suivant : {{@tube.practicalTitle}}</:label>
          </PixSelect>
        {{/if}}
        {{#if @displaySkillDifficultyAvailability}}
          <div class="skill-availability">
            {{#each this.skillAvailabilityMap as |skillAvailability|}}
              <div
                class="skill-square skill-square__{{skillAvailability.availability}}"
              >{{skillAvailability.difficulty}}</div>
            {{/each}}
          </div>
        {{/if}}
      </div>
    </td>
    {{#if @displayDeviceCompatibility}}
      <td class="table__column--center">
        <div class="icon-container" aria-label="{{if @tube.mobile 'compatible mobile' 'incompatible mobile'}}">
          <PixTooltip @position="bottom" @isInline={{true}}>
            <:triggerElement>
              <PixIcon @name={{this.mobileIcon}} class="{{if @tube.mobile 'is-responsive' 'not-responsive'}}" />
            </:triggerElement>
            <:tooltip>
              {{#if @tube.mobile}}
                Compatible avec smartphone
              {{else}}
                Non compatible avec smartphone
              {{/if}}
            </:tooltip>
          </PixTooltip>
        </div>
        <div class="icon-container" aria-label="{{if @tube.tablet 'compatible tablette' 'incompatible tablette'}}">
          <PixTooltip @position="bottom" @isInline={{true}}>
            <:triggerElement>
              <PixIcon @name={{this.tabletIcon}} class="{{if @tube.tablet 'is-responsive' 'not-responsive'}}" />
            </:triggerElement>
            <:tooltip>
              {{#if @tube.tablet}}
                Compatible avec tablette
              {{else}}
                Non compatible avec tablette
              {{/if}}
            </:tooltip>
          </PixTooltip>
        </div>
      </td>
    {{/if}}
  </template>
}
