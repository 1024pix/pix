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
        const hasSkill = this.args.skills.find((skill) => skill.difficulty === i);
        this.skillAvailabilityMap.push({ difficulty: i, availability: hasSkill ? 'active' : 'missing' });
      }
    }
  }

  <template>
    <td data-testid="title-{{@id}}">
      {{@title}}
    </td>
    <td class="table__column--center">
      <div class="level-selection">
        <span data-testid="level-{{@id}}">{{@level}}</span>
        {{#if @displaySkillDifficultyAvailability}}
          <div class="skill-availability" data-testid="skill-availability-{{@id}}">
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
        <div
          class="icon-container"
          aria-label="{{if @mobile 'compatible mobile' 'incompatible mobile'}}"
          data-testid="mobile-compliant-{{@id}}"
        >
          <FaIcon @icon="mobile-screen-button" class="fa-2x {{if @mobile 'is-responsive'}}" />
          {{#unless @mobile}}
            <FaIcon @icon="slash" class="fa-2x not-responsive" />
          {{/unless}}
        </div>
        <div
          class="icon-container"
          aria-label="{{if @tablet 'compatible tablette' 'incompatible tablette'}}"
          data-testid="tablet-compliant-{{@id}}"
        >
          <FaIcon @icon="tablet-screen-button" class="fa-2x {{if @tablet 'is-responsive'}}" />
          {{#unless @tablet}}
            <FaIcon @icon="slash" class="fa-2x not-responsive" />
          {{/unless}}
        </div>
      </td>
    {{/if}}
  </template>
}
