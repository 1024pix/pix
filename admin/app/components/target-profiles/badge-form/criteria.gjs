import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Card from '../../card';
import CampaignCriterion from './campaign-criterion';
import CappedTubesCriterion from './capped-tubes-criterion';

export default class Criteria extends Component {
  @service store;
  @tracked hasCampaignCriterion = false;
  @tracked hasCappedTubesCriteria = false;

  @action
  onHasCampaignCriterionChange(e) {
    this.hasCampaignCriterion = e.target.checked;
    if (!this.hasCampaignCriterion) {
      this.args.badge.campaignThreshold = null;
    }
  }

  @action
  onHasCappedTubesCriteriaChange(e) {
    this.hasCappedTubesCriteria = e.target.checked;
    if (this.hasCappedTubesCriteria) {
      this.args.badge.cappedTubesCriteria.pushObject({});
    } else {
      this.args.badge.cappedTubesCriteria.clear();
    }
  }

  @action
  onCampaignThresholdChange(e) {
    this.args.badge.campaignThreshold = e.target.value;
  }

  @action
  onCappedTubesThresholdChange(criterion, e) {
    criterion.threshold = e.target.value;
  }

  @action
  onCappedTubesNameChange(criterion, e) {
    criterion.name = e.target.value;
  }

  @action
  onCappedTubesSelectionChange(criterion, selection) {
    criterion.cappedTubes = selection;
  }

  @action
  addCappedTubeCriterion() {
    this.args.badge.cappedTubesCriteria.pushObject({});
  }

  @action
  removeCappedTubeCriterion(index) {
    this.args.badge.cappedTubesCriteria.removeAt(index);
  }

  <template>
    <Card @title="Critères d'obtention du badge">
      <PixNotificationAlert @type="info" @withIcon={{true}}>
        Vous pouvez définir des critères de réussite du badge
        <strong>sur une liste de sujets ET/OU sur l’ensemble du profil cible</strong>.
        <br />
        <strong>Toutes les conditions devront être remplies</strong>
        pour obtenir le badge.
      </PixNotificationAlert>
      <div class="badge-form-criteria-choice">
        <p>Définir un critère d'obtention&nbsp;:</p>
        <PixCheckbox
          @id="hasCampaignCriterion"
          @checked={{this.hasCampaignCriterion}}
          {{on "change" this.onHasCampaignCriterionChange}}
        >
          <:label>sur l'ensemble du profil cible</:label>
        </PixCheckbox>
        <PixCheckbox
          @id="hasCappedTubesCriteria"
          @checked={{this.hasCappedTubesCriteria}}
          {{on "change" this.onHasCappedTubesCriteriaChange}}
        >
          <:label>sur une sélection de sujets du profil cible</:label>
        </PixCheckbox>
      </div>
      {{#if this.hasCampaignCriterion}}
        <CampaignCriterion @onThresholdChange={{this.onCampaignThresholdChange}} />
      {{/if}}
      {{#if this.hasCappedTubesCriteria}}
        {{#each @badge.cappedTubesCriteria as |criterion index|}}
          <CappedTubesCriterion
            @id={{concat "cappedTubeCriterion" index}}
            @areas={{@areas}}
            @onThresholdChange={{fn this.onCappedTubesThresholdChange criterion}}
            @onNameChange={{fn this.onCappedTubesNameChange criterion}}
            @onTubesSelectionChange={{fn this.onCappedTubesSelectionChange criterion}}
            @remove={{fn this.removeCappedTubeCriterion index}}
          />
        {{/each}}
        <PixButton
          class="badge-form-criterion__add"
          @variant="primary"
          @size="small"
          @triggerAction={{this.addCappedTubeCriterion}}
          @iconBefore="add"
        >
          Ajouter une nouvelle sélection de sujets
        </PixButton>
      {{/if}}
    </Card>
  </template>
}
