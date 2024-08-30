import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import Breadcrumb from '../layout/breadcrumb';
import UpdateAutonomousCourseForm from './update-autonomous-course-form';
import ViewAutonomousCourse from './view-autonomous-course';

export default class Details extends Component {
  @tracked isEditMode = false;
  @service intl;
  @service notifications;
  @service router;

  @action
  toggleEditMode() {
    if (this.isEditMode) {
      this.args.autonomousCourse.rollbackAttributes();
    }
    this.isEditMode = !this.isEditMode;
  }

  @action
  async update() {
    this.isEditMode = false;
    try {
      await this.args.autonomousCourse.save();
      this.notifications.success('Parcours autonome modifié avec succès.');
    } catch ({ errors }) {
      this.args.autonomousCourse.rollbackAttributes();

      if (errors[0]?.detail) {
        return this.notifications.error(errors[0].detail);
      }
    }
  }

  <template>
    <header>
      <Breadcrumb @title={{@autonomousCourse.internalTitle}} />
    </header>

    <main class="page-body">
      <section class="page-section">
        <h2>{{@autonomousCourse.internalTitle}}</h2>

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
              {{t "common.actions.edit"}}
            </PixButton>
          </div>
        {{/if}}

      </section>
    </main>
  </template>
}
