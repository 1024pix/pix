import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class UpdateAutonomousCourseForm extends Component {
  constructor() {
    super(...arguments);
  }

  @action
  updateAutonomousCourseValue(key, event) {
    this.args.autonomousCourse[key] = event.target.value;
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.update();
  }

  <template>
    <form class="form update-autonomous-course" {{on "submit" this.onSubmit}}>
      <span class="form__instructions">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </span>
      <PixInput
        class="form-field"
        @id="autonomousCourseName"
        required={{true}}
        @requiredLabel={{t "common.forms.mandatory"}}
        @value={{@autonomousCourse.internalTitle}}
        {{on "change" (fn this.updateAutonomousCourseValue "internalTitle")}}
      >
        <:label>{{t "components.autonomous-courses.update.internal-title.label"}} :</:label>
      </PixInput>
      <PixInput
        @id="nom-public"
        class="form-field"
        placeholder={{t "components.autonomous-courses.update.public-title.placeholder" htmlSafe=true}}
        required={{true}}
        maxlength="50"
        @value={{@autonomousCourse.publicTitle}}
        @requiredLabel={{t "common.forms.mandatory"}}
        @subLabel={{t "components.autonomous-courses.update.public-title.sublabel"}}
        {{on "change" (fn this.updateAutonomousCourseValue "publicTitle")}}
      >
        <:label>{{t "components.autonomous-courses.update.public-title.label" htmlSafe=true}}:</:label>
      </PixInput>
      <PixTextarea
        @id="text-page-accueil"
        @maxlength="5000"
        @value={{@autonomousCourse.customLandingPageText}}
        placeholder={{t "components.autonomous-courses.update.custom-landing-page.placeholder"}}
        {{on "change" (fn this.updateAutonomousCourseValue "customLandingPageText")}}
      >
        <:label>{{t "components.autonomous-courses.update.custom-landing-page.label"}} :</:label>
      </PixTextarea>
      <div class="form-actions">
        <PixButton type="reset" @variant="secondary" @size="small" @triggerAction={{@cancel}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @variant="success" @size="small" @type="submit">
          {{t "components.autonomous-courses.update.save"}}
        </PixButton>
      </div>
    </form>
  </template>
}
