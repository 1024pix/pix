import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import TubesSelection from '../../../common/tubes-selection';

export default class NewVersionForm extends Component {
  @service intl;
  @service pixToast;
  @service router;
  @service store;

  @tracked selectedTubes = [];

  @action
  onTubesSelectionChange(selectedTubes) {
    this.selectedTubes = selectedTubes.map((tube) => this.store.peekRecord('tube', tube.id));
  }

  @action
  async onSubmit() {
    const consolidatedFramework = this.store.createRecord('certification-consolidated-framework', {
      scope: this.args.scope,
      tubes: this.selectedTubes,
    });

    try {
      await consolidatedFramework.save();

      this.router.transitionTo('authenticated.certification-frameworks.item.framework');
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.item.framework.new-version-form.success-notification',
        ),
      });
    } catch (error) {
      this.pixToast.sendErrorNotification({ message: error.errors?.[0].detail });
    }
  }

  get checkedTubes() {
    if (!this.args.activeVersion) return [];

    const competences = [];
    const thematics = [];
    const tubes = [];

    const areas = this.args.activeVersion.hasMany('areas').value();

    for (const area of areas) {
      competences.push(...area.hasMany('competences').value());
    }

    for (const competence of competences) {
      thematics.push(...competence.hasMany('thematics').value());
    }

    for (const thematic of thematics) {
      tubes.push(...thematic.hasMany('tubes').value());
    }

    return tubes.flat();
  }

  get checkedAreas() {
    if (!this.args.activeVersion) return [];
    return this.args.activeVersion.hasMany('areas').value();
  }

  <template>
    <h2 class="framework-creation-form__title">
      {{t "components.certification-frameworks.item.framework.new-version-form.title"}}
    </h2>

    <form>
      <section>
        {{#if @frameworks.length}}
          <TubesSelection
            @frameworks={{@frameworks}}
            @onChange={{this.onTubesSelectionChange}}
            @initialAreas={{this.checkedAreas}}
            @initialCappedTubes={{this.checkedTubes}}
            @displaySkillDifficultyAvailability={{true}}
            @displaySkillDifficultySelection={{false}}
            @displayDeviceCompatibility={{true}}
            @displayJsonImportButton={{false}}
          />
          <ul class="framework-creation-form__buttons">
            <li>
              <PixButton @triggerAction={{this.onSubmit}} @isDisabled={{if this.selectedTubes.length false true}}>
                {{t "components.certification-frameworks.item.framework.new-version-form.submit-button"}}
              </PixButton>
            </li>
            <li>
              <PixButtonLink @route="authenticated.certification-frameworks.item.framework" @variant="secondary">
                {{t "common.actions.cancel"}}
              </PixButtonLink>
            </li>
          </ul>
        {{/if}}
      </section>
    </form>
  </template>
}
