import PixIcon from '@1024pix/pix-ui/components/pix-icon';
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

  get mobileIcon() {
    return this.args.mobile ? 'mobile' : 'mobileOff';
  }

  get tabletIcon() {
    return this.args.tablet ? 'tablet' : 'tabletOff';
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
          <PixIcon @name={{this.mobileIcon}} @plainIcon={{true}} class="{{if @mobile 'is-responsive'}}" />
        </div>
        <div
          class="icon-container"
          aria-label="{{if @tablet 'compatible tablette' 'incompatible tablette'}}"
          data-testid="tablet-compliant-{{@id}}"
        >
          <PixIcon @name={{this.tabletIcon}} @plainIcon={{true}} class="{{if @mobile 'is-responsive'}}" />
        </div>
      </td>
    {{/if}}
  </template>
}
