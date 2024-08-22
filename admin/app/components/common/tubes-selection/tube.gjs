import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
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
        <PixSelect
          @screenReaderOnly={{true}}
          @options={{this.levelOptions}}
          @value={{this.selectedLevel}}
          @onChange={{this.setLevelTube}}
          @placeholder="À sélectionner"
          @hideDefaultOption={{true}}
          class="tubes-selection__level-select"
        >
          <:label>Sélection du niveau du sujet suivant : {{@tube.practicalTitle}}</:label>
        </PixSelect>
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
          <FaIcon @icon="mobile-screen-button" class="fa-2x {{if @tube.mobile 'is-responsive'}}" />
          {{#unless @tube.mobile}}
            <FaIcon @icon="slash" class="fa-2x not-responsive" />
          {{/unless}}
        </div>
        <div class="icon-container" aria-label="{{if @tube.tablet 'compatible tablette' 'incompatible tablette'}}">
          <FaIcon @icon="tablet-screen-button" class="fa-2x {{if @tube.tablet 'is-responsive'}}" />
          {{#unless @tube.tablet}}
            <FaIcon @icon="slash" class="fa-2x not-responsive" />
          {{/unless}}
        </div>
      </td>
    {{/if}}
  </template>
}
