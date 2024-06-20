import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CompetenceScoringConfiguration extends Component {
  @service store;
  @service notifications;
  competenceScoringConfiguration = '';

  @action
  onCompetenceScoringConfigurationChange(event) {
    this.competenceScoringConfiguration = event.target.value;
  }

  @action
  async onCompetenceScoringConfigurationSubmit(event) {
    event.preventDefault();
    const adapter = this.store.adapterFor('scoring-configuration');
    try {
      await adapter.updateCompetenceScoringConfiguration(this.competenceScoringConfiguration);
      this.notifications.success('Configuration enregistrée');
    } catch (e) {
      this.notifications.error("La config n'a pas pu être ajoutée");
    }
  }

  <template>
    <section class="page-section">
      <h2 class="page-section__title">
        {{t "pages.administration.certification.competence-scoring-configuration.title"}}
      </h2>

      <form class="competence-scoring-configuration-form" {{on "submit" this.onCompetenceScoringConfigurationSubmit}}>
        <PixTextarea
          rows="4"
          @id="competence-configuration"
          @value={{this.competenceScoringConfiguration}}
          {{on "change" this.onCompetenceScoringConfigurationChange}}
        >
          <:label>{{t "pages.administration.certification.competence-scoring-configuration.form.label"}}</:label>
        </PixTextarea>
        <PixButton @type="submit">{{t "common.actions.save"}}</PixButton>
      </form>
    </section>
  </template>
}
