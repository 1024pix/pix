import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

export default class CampaignCriterion extends Component {
  @service notifications;

  @tracked isEditModalVisible = false;
  @tracked thresholdInputValue = this.previousTreshold;

  get previousTreshold() {
    return this.args.criterion.threshold;
  }

  @action
  toggleEditModal() {
    this.isEditModalVisible = !this.isEditModalVisible;
  }

  @action
  handleThresholdChange(event) {
    this.thresholdInputValue = Number(event.target.value);
  }

  @action
  async updateThreshold() {
    const criterion = this.args.criterion;
    criterion.threshold = this.thresholdInputValue;

    try {
      await criterion.save();
      this.notifications.success("Seuil d'obtention du critère modifié avec succès.");
      this.toggleEditModal();
    } catch (responseError) {
      responseError?.errors?.forEach((error) => {
        if (error?.detail) {
          this.notifications.error(error.detail);
        } else {
          this.notifications.error("Problème lors de la modification du seuil d'obtention du critère.");
        }
      });
    }
  }

  <template>
    <article class="badge-criterion">
      <div class="badge-criterion__header">
        <h2 class="badge-criterion__title">Critère d'obtention basé sur l'ensemble du profil cible&nbsp;:</h2>
        <PixTooltip @hide={{@isEditable}} @isWide={{true}}>
          <:triggerElement>
            <PixButton
              @variant="secondary"
              @size="small"
              @triggerAction={{this.toggleEditModal}}
              @isDisabled={{not @isEditable}}
            >
              Modifier le critère
            </PixButton>
          </:triggerElement>

          <:tooltip>
            Non modifiable car le profil cible est relié à une&nbsp;campagne
          </:tooltip>
        </PixTooltip>
      </div>
      <div class="card">
        <div class="card__content">
          <p data-testid="campaign-criterion-text">
            L'évalué doit obtenir
            <strong>{{@criterion.threshold}}%</strong>
            sur l'ensemble des sujets du profil cible.
          </p>
        </div>
      </div>
    </article>

    {{#if @isEditable}}
      <PixModal
        @title="Modification du critère d'obtention basé sur l'ensemble du profil cible"
        @showModal={{this.isEditModalVisible}}
        @onCloseButtonClick={{this.toggleEditModal}}
      >
        <:content>
          <PixInput
            @id="campaign-criterion-threshold"
            value={{this.thresholdInputValue}}
            onchange={{this.handleThresholdChange}}
            @subLabel="En pourcent (%)"
            @requiredLabel="Champ requis"
          >
            <:label>Nouveau seuil d'obtention du critère&nbsp;:</:label>
          </PixInput>
        </:content>
        <:footer>
          <PixButton @triggerAction={{this.toggleEditModal}} @size="small" @variant="secondary">
            {{t "common.actions.cancel"}}
          </PixButton>
          <PixButton @triggerAction={{this.updateThreshold}} @size="small">
            {{t "common.actions.save"}}
          </PixButton>
        </:footer>
      </PixModal>
    {{/if}}
  </template>
}
