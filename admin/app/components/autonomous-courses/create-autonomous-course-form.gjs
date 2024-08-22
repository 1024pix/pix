import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixFilterableAndSearchableSelect from '@1024pix/pix-ui/components/pix-filterable-and-searchable-select';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Card from 'pix-admin/components/card';

export default class CreateAutonomousCourseForm extends Component {
  @tracked submitting = false;
  constructor() {
    super(...arguments);
  }

  @action
  updateAutonomousCourseValue(key, event) {
    this.args.autonomousCourse[key] = event.target.value;
  }

  @action
  selectTargetProfile(targetProfileId) {
    this.args.autonomousCourse.targetProfileId = targetProfileId;
  }

  get targetProfileListOptions() {
    const options = this.args.targetProfiles.map((targetProfile) => ({
      value: targetProfile.id,
      label: targetProfile.name,
      category: targetProfile.category,
      order: 'OTHER' === targetProfile.category ? 1 : 0,
    }));

    options.sort((targetProfileA, targetProfileB) => {
      if (targetProfileA.order !== targetProfileB.order) {
        return targetProfileA.order - targetProfileB.order;
      }
      if (targetProfileA.category !== targetProfileB.category) {
        return targetProfileA.category.localeCompare(targetProfileB.category);
      }
      return targetProfileA.label.localeCompare(targetProfileB.label);
    });

    return options;
  }

  @action
  async onSubmit(event) {
    const autonomousCourse = {
      internalTitle: this.args.autonomousCourse.internalTitle,
      publicTitle: this.args.autonomousCourse.publicTitle,
      targetProfileId: this.args.autonomousCourse.targetProfileId,
      customLandingPageText: this.args.autonomousCourse.customLandingPageText,
    };
    try {
      this.submitting = true;
      await this.args.onSubmit(event, autonomousCourse);
    } finally {
      this.submitting = false;
    }
  }

  <template>
    <form class="admin-form" {{on "submit" this.onSubmit}}>
      <p class="admin-form__mandatory-text">
        {{t "common.forms.mandatory-fields" htmlSafe=true}}
      </p>
      <section class="admin-form__content admin-form__content--with-counters">
        <Card
          class="admin-form__card"
          @title={{t "pages.autonomous-course.creation-form-fields.technical-informations.title"}}
        >
          <PixInput
            class="form-field"
            @id="autonomousCourseName"
            required="true"
            @requiredLabel={{t "common.forms.mandatory"}}
            {{on "change" (fn this.updateAutonomousCourseValue "internalTitle")}}
          >
            <:label>{{t "pages.autonomous-course.creation-form-fields.technical-informations.label"}} :</:label>
          </PixInput>
          <PixFilterableAndSearchableSelect
            @placeholder={{t "pages.autonomous-course.creation-form-fields.target-profile.placeholder"}}
            @options={{this.targetProfileListOptions}}
            @hideDefaultOption={{true}}
            @onChange={{this.selectTargetProfile}}
            @categoriesPlaceholder="Filtres"
            @value={{@autonomousCourse.targetProfileId}}
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{if
              @errors.autonomousCourse
              (t "api-error-messages.campaign-creation.target-profile-required")
            }}
            @isSearchable={{true}}
            @searchLabel={{t "pages.autonomous-course.creation-form-fields.target-profile.search-label"}}
            @subLabel={{t "pages.autonomous-course.creation-form-fields.target-profile.sub-label"}}
            required={{true}}
          >
            <:label>{{t "pages.autonomous-course.creation-form-fields.target-profile.label"}}</:label>
            <:categoriesLabel>{{t
                "pages.autonomous-course.creation-form-fields.target-profile.category-label"
              }}</:categoriesLabel>
          </PixFilterableAndSearchableSelect>
        </Card>
        <Card
          class="admin-form__card"
          @title={{t "pages.autonomous-course.creation-form-fields.user-information.title"}}
        >
          <PixInput
            @id="nom-public"
            class="form-field"
            placeholder={{t "pages.autonomous-course.creation-form-fields.user-information.public-name.placeholder"}}
            required={{true}}
            @requiredLabel={{t "common.forms.mandatory"}}
            maxlength="50"
            @subLabel={{t "pages.autonomous-course.creation-form-fields.user-information.public-name.sub-label"}}
            {{on "change" (fn this.updateAutonomousCourseValue "publicTitle")}}
          >
            <:label>{{t
                "pages.autonomous-course.creation-form-fields.user-information.public-name.label"
                htmlSafe=true
              }}
              :</:label>
          </PixInput>
          <PixTextarea
            @id="text-page-accueil"
            class="form-field"
            @maxlength="5000"
            placeholder={{t "pages.autonomous-course.creation-form-fields.user-information.homepage.placeholder"}}
            {{on "change" (fn this.updateAutonomousCourseValue "customLandingPageText")}}
          >
            <:label>{{t "pages.autonomous-course.creation-form-fields.user-information.homepage.label"}} :</:label>
          </PixTextarea>
        </Card>
      </section>
      <section class="admin-form__actions">
        <PixButton @variant="secondary" @size="large" @triggerAction={{@onCancel}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton
          @variant="success"
          @size="large"
          @type="submit"
          @isLoading={{this.submitting}}
          @triggerAction={{this.noop}}
        >
          {{t "pages.autonomous-course.creation-form-fields.create-autonomous-course"}}
        </PixButton>
      </section>
    </form>
  </template>
}
