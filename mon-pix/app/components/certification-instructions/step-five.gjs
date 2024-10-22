import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class StepFive extends Component {
  @tracked checked = false;

  @action
  onChange(event) {
    this.checked = !!event.target.checked;
    this.args.enableNextButton(this.checked);
  }

  <template>
    <div class="instructions-content" tabindex="0">
      <span class="instructions-content__title--bold">{{t "pages.certification-instructions.steps.5.text"}}</span>
      <ul class="instructions-content-list">
        <li>
          {{t "pages.certification-instructions.steps.5.list.no-communication" htmlSafe=true}}
        </li>
        <li>
          {{t "pages.certification-instructions.steps.5.list.no-connected-device" htmlSafe=true}}
        </li>
        <li>
          {{t "pages.certification-instructions.steps.5.list.no-cheat-sheet" htmlSafe=true}}
        </li>
        <li>
          {{t "pages.certification-instructions.steps.5.list.no-artificial-intelligence" htmlSafe=true}}
        </li>
        <li>
          {{t "pages.certification-instructions.steps.5.list.no-forum" htmlSafe=true}}
        </li>
        <li>
          {{t "pages.certification-instructions.steps.5.list.miscellaneous" htmlSafe=true}}
        </li>
      </ul>
      <PixCheckbox {{on "change" this.onChange}}>
        <:label>{{t "pages.certification-instructions.steps.5.checkbox-label"}}</:label>
      </PixCheckbox>
    </div>
  </template>
}
