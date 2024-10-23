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
      <span class="instructions-content__title">{{t "pages.certification-instructions.steps.5.text"}}</span>
      <ul class="instructions-content__list">
        <li>{{t "pages.certification-instructions.steps.5.list.1" htmlSafe=true}}</li>
        <li>{{t "pages.certification-instructions.steps.5.list.2" htmlSafe=true}}</li>
        <li>{{t "pages.certification-instructions.steps.5.list.3" htmlSafe=true}}</li>
        <li>{{t "pages.certification-instructions.steps.5.list.4" htmlSafe=true}}</li>
        <li>{{t "pages.certification-instructions.steps.5.list.5" htmlSafe=true}}</li>
        <li>{{t "pages.certification-instructions.steps.5.list.6" htmlSafe=true}}</li>
        <li>{{t "pages.certification-instructions.steps.5.list.7" htmlSafe=true}}</li>
      </ul>
      <p class="instructions-content__paragraph--light">
        <em>{{t "pages.certification-instructions.steps.5.pix-companion"}}</em>
      </p>
      <PixCheckbox {{on "change" this.onChange}}>
        <:label>{{t "pages.certification-instructions.steps.5.checkbox-label"}}</:label>
      </PixCheckbox>
    </div>
  </template>
}
