import { PixCheckbox, PixIcon, PixSelect, PixTooltip } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

const MAX_TUBE_LEVEL = 8;

export default class Tube extends Component {
  @tracked skillAvailabilityMap = [];

  constructor(...args) {
    super(...args);
    for (let i = 1; i <= MAX_TUBE_LEVEL; ++i) {
      const hasSkill = this.args.tube.skills.find((skill) => skill.difficulty === i);
      this.skillAvailabilityMap.push({ difficulty: i, availability: hasSkill ? 'active' : 'missing' });
    }
  }

  get levelOptions() {
    return Array.from({ length: MAX_TUBE_LEVEL }, (_, index) => ({
      value: index + 1,
      label: `${index + 1}`,
    }));
  }

  get checked() {
    return this.args.isTubeSelected(this.args.tube);
  }

  get selectedLevel() {
    return this.args.selectedTubeLevels.get(this.args.tube.id);
  }

  @action
  setTubeLevel(level) {
    this.args.setTubeLevel(this.args.tube.id, level);
  }

  @action
  toggleTube(event) {
    if (event.target.checked) {
      this.args.selectTube(this.args.tube);
    } else {
      this.args.unselectTube(this.args.tube);
    }
  }

  <template>
    <td>
      <PixCheckbox @id="tube-{{@tube.id}}" {{on "click" this.toggleTube}} @checked={{this.checked}}>
        <:label>
          {{@tube.practicalTitle}}
          :
          {{@tube.practicalDescription}}
        </:label>
      </PixCheckbox>
    </td>
    <td>
      <div class="level-selection">
        <PixSelect
          @screenReaderOnly={{true}}
          @options={{this.levelOptions}}
          @value={{this.selectedLevel}}
          @onChange={{this.setTubeLevel}}
          @placeholder={{t "pages.preselect-target-profile.levels.placeholder"}}
          @hideDefaultOption={{true}}
        >
          <:label>{{t "pages.preselect-target-profile.levels.label" title=@tube.practicalTitle}}</:label>
        </PixSelect>
        <PixTooltip @position="bottom" @isInline={{true}}>
          <:triggerElement>
            <div class="skill-availability">
              {{#each this.skillAvailabilityMap as |skillAvailability|}}
                <div
                  class="skill-square skill-square__{{skillAvailability.availability}}"
                >{{skillAvailability.difficulty}}</div>
              {{/each}}
            </div>
          </:triggerElement>
          <:tooltip>
            {{t "pages.preselect-target-profile.levels.tooltip"}}
          </:tooltip>
        </PixTooltip>

      </div>
    </td>
    <td class="table__column--center">
      <div
        class="icon-container"
        aria-label="{{if
          @tube.isMobileCompliant
          (t 'pages.preselect-target-profile.table.is-responsive')
          (t 'pages.preselect-target-profile.table.not-responsive')
        }}"
      >
        <PixTooltip @position="bottom" @isInline={{true}}>
          <:triggerElement>
            <PixIcon
              @name="{{if @tube.isMobileCompliant 'mobile' 'mobileOff'}}"
              class="{{if @tube.isMobileCompliant 'is-responsive' 'not-responsive'}}"
            />
          </:triggerElement>
          <:tooltip>
            {{#if @tube.isMobileCompliant}}
              {{t "pages.preselect-target-profile.compatibility.mobile.yes"}}
            {{else}}
              {{t "pages.preselect-target-profile.compatibility.mobile.no"}}
            {{/if}}
          </:tooltip>
        </PixTooltip>
      </div>

      <div
        class="icon-container"
        aria-label="{{if
          @tube.isTabletCompliant
          (t 'pages.preselect-target-profile.table.is-responsive')
          (t 'pages.preselect-target-profile.table.not-responsive')
        }}"
      >
        <PixTooltip @position="bottom" @isInline={{true}}>
          <:triggerElement>
            <PixIcon
              @name="{{if @tube.isMobileCompliant 'tablet' 'tabletOff'}}"
              class="{{if @tube.isMobileCompliant 'is-responsive' 'not-responsive'}}"
            />
          </:triggerElement>
          <:tooltip>
            {{#if @tube.isTabletCompliant}}
              {{t "pages.preselect-target-profile.compatibility.tablet.yes"}}
            {{else}}
              {{t "pages.preselect-target-profile.compatibility.tablet.no"}}
            {{/if}}
          </:tooltip>
        </PixTooltip>
      </div>
    </td>
  </template>
}
