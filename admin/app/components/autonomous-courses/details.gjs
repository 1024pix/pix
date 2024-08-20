import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import UpdateAutonomousCourseForm from './update-autonomous-course-form';
import ViewAutonomousCourse from './view-autonomous-course';

export default class Details extends Component {
  @tracked isEditMode = false;

  constructor() {
    super(...arguments);
  }

  @action
  toggleEditMode() {
    if (this.isEditMode) {
      this.args.reset();
    }
    this.isEditMode = !this.isEditMode;
  }

  @action
  async update() {
    this.args.update();
    this.isEditMode = false;
  }

  <template>
    <section class="page-section">
      <h2 class="page-section__title">{{@autonomousCourse.internalTitle}}</h2>

      {{#if this.isEditMode}}
        <UpdateAutonomousCourseForm
          @autonomousCourse={{@autonomousCourse}}
          @update={{this.update}}
          @cancel={{this.toggleEditMode}}
        />
      {{else}}
        <ViewAutonomousCourse @autonomousCourse={{@autonomousCourse}} />
        <div class="form-actions">
          <PixButton @variant="secondary" @size="small" @triggerAction={{this.toggleEditMode}}>
            Modifier
          </PixButton>
        </div>
      {{/if}}

    </section>
  </template>
}
