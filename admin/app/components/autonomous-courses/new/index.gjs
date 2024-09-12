import PixButton from '@1024pix/pix-ui/components/pix-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';

import Breadcrumb from '../../layout/breadcrumb';
import TechnicalInformations from './technical-informations';
import UserInformations from './user-informations';

export default class NewAutonomousCourse extends Component {
  @service intl;
  @tracked submitting = false;

  constructor() {
    super(...arguments);
  }

  get translatedTitle() {
    return this.intl.t('components.autonomous-courses.new.title');
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
    {{pageTitle this.translatedTitle}}

    <header>
      <Breadcrumb />
    </header>

    <main class="main-admin-form">
      <form class="admin-form" {{on "submit" this.onSubmit}}>
        <p class="admin-form__mandatory-text">
          {{t "common.forms.mandatory-fields" htmlSafe=true}}
        </p>
        <section class="admin-form__content admin-form__content--with-counters">
          <TechnicalInformations
            @updateAutonomousCourseValue={{this.updateAutonomousCourseValue}}
            @targetProfileListOptions={{this.targetProfileListOptions}}
            @selectTargetProfile={{this.selectTargetProfile}}
            @autonomousCourse={{@autonomousCourse}}
            @errors={{@errors}}
          />
          <UserInformations @updateAutonomousCourseValue={{this.updateAutonomousCourseValue}} />
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
            {{t "components.autonomous-courses.new.create-autonomous-course"}}
          </PixButton>
        </section>
      </form>
    </main>
  </template>
}
