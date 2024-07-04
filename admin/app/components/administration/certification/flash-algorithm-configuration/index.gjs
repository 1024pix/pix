import PixBlock from '@1024pix/pix-ui/components/pix-block';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import Form from './form';

export default class FlashAlgorithmConfiguration extends Component {
  @service store;
  @service notifications;
  @tracked form = {
    maximumAssessmentLength: this.args.model.maximumAssessmentLength,
    warmUpLength: this.args.model.warmUpLength,
    challengesBetweenSameCompetence: this.args.model.challengesBetweenSameCompetence,
    variationPercent: this.args.model.variationPercent,
    variationPercentUntil: this.args.model.variationPercentUntil,
    doubleMeasuresUntil: this.args.model.doubleMeasuresUntil,
    limitToOneQuestionPerTube: this.args.model.limitToOneQuestionPerTube,
    enablePassageByAllCompetences: this.args.model.enablePassageByAllCompetences,
  };

  @action
  async onCreateFlashAlgorithmConfiguration(event) {
    event.preventDefault();
    const adapter = this.store.adapterFor('flash-algorithm-configuration');
    try {
      await adapter.createRecord(this.form);
      this.notifications.success('La configuration a été créée');
    } catch (errorResponse) {
      this.notifications.error("La configuration n'a pu être créée");
    }
  }

  @action
  updateNumberValues(event) {
    this.form = { ...this.form, [event.target.id]: event.target.value };
  }

  @action
  updateCheckboxValues(event) {
    this.form = { ...this.form, [event.target.id]: event.target.checked };
  }

  <template>
    <PixBlock class="page-section">

      <h2 class="page-section__title">
        {{t "pages.administration.certification.flash-algorithm-configuration.title"}}
      </h2>

      <Form
        @form={{this.form}}
        @updateNumberValues={{this.updateNumberValues}}
        @updateCheckboxValues={{this.updateCheckboxValues}}
        @onCreateFlashAlgorithmConfiguration={{this.onCreateFlashAlgorithmConfiguration}}
      />

    </PixBlock>
  </template>
}
