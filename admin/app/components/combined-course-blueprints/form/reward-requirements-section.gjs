import { PixButton, PixRadioButton, PixTextarea } from '@1024pix/nebulix-ember';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { and, not, or } from 'ember-truth-helpers';

import Card from '../../card';
import CampaignCriterion from '../../common/tubes-selection/campaign-criterion';
import CappedTubesCriterion from '../../common/tubes-selection/capped-tubes-criterion';
import SelectAttestation from '../select-attestation';

export default class RewardRequirementsSection extends Component {
  @tracked cappedTubeRequirements = [];
  @tracked usesCappedTubesSelectionForCriteria = false;
  @tracked usesAllTargetProfilesForCriteria = false;
  @tracked schemaThreshold = null;

  get blueprintHasTargetProfiles() {
    return this.args.blueprint.content.filter((item) => item.type === 'campaign').length > 0;
  }

  @action
  setAttestation(rewardId) {
    this.args.blueprint.rewardId = rewardId;
    this.args.blueprint.rewardType = 'ATTESTATION';
  }

  @action
  setRewardRequirementsDescription(e) {
    this.args.blueprint.rewardRequirementsDescription = e.target.value;
  }

  @action
  toggleCriteriaSelectionMode(e) {
    this.usesCappedTubesSelectionForCriteria = e.target.value === 'use-tubes-selection';
    this.usesAllTargetProfilesForCriteria = e.target.value === 'use-all-tubes';
    this.#notifyChange();
  }

  @action
  setSchemaThreshold(e) {
    this.schemaThreshold = e.target.value;
    this.#notifyChange();
  }

  @action
  addCappedTubeSubset() {
    this.cappedTubeRequirements = [...this.cappedTubeRequirements, {}];
    this.#notifyChange();
  }

  @action
  removeCappedTubeCriterion(index) {
    const updatedCappedTubeRequirements = [...this.cappedTubeRequirements];
    updatedCappedTubeRequirements.splice(index, 1);
    this.cappedTubeRequirements = updatedCappedTubeRequirements;
    this.#notifyChange();
  }

  @action
  onCappedTubesThresholdChange(criterion, e) {
    criterion.threshold = e.target.value;
    this.#notifyChange();
  }

  @action
  onCappedTubesNameChange(criterion, e) {
    criterion.name = e.target.value;
    this.#notifyChange();
  }

  @action
  onCappedTubesSelectionChange(criterion, selection) {
    criterion.tubes = selection.map(({ id, level }) => ({ tubeId: id, level }));
    this.#notifyChange();
  }

  #notifyChange() {
    this.args.onRewardRequirementsChange({
      cappedTubeRequirements: this.cappedTubeRequirements,
      usesCappedTubesSelectionForCriteria: this.usesCappedTubesSelectionForCriteria,
      usesAllTargetProfilesForCriteria: this.usesAllTargetProfilesForCriteria,
      schemaThreshold: this.schemaThreshold,
    });
  }

  <template>
    <Card
      class="combined-course-blueprint-form__card"
      @title={{t "components.combined-course-blueprints.create.attestations"}}
    >
      {{#unless @updateMode}}
        <SelectAttestation
          @attestations={{@model.attestations}}
          @value={{@blueprint.rewardId}}
          @onChange={{this.setAttestation}}
        />
      {{/unless}}
      {{#if (or (and (not @updateMode) @blueprint.rewardId) (and @updateMode @blueprint.attestationLabel))}}
        <PixTextarea
          @id="reward-requirements"
          @value={{@blueprint.rewardRequirementsDescription}}
          {{on "change" this.setRewardRequirementsDescription}}
          rows="10"
        >
          <:label>
            {{t "components.combined-course-blueprints.labels.reward-requirements.description"}}
          </:label>
        </PixTextarea>
        {{#unless @updateMode}}
          {{#if this.blueprintHasTargetProfiles}}
            <fieldset class="badge-form-criteria-choice">
              <p>{{t "components.combined-course-blueprints.labels.reward-requirements.reward-criteria-choice"}}</p>

              <PixRadioButton
                name="subsetNumberChoice"
                @checked={{this.usesAllTargetProfilesForCriteria}}
                @value="use-all-tubes"
                {{on "change" this.toggleCriteriaSelectionMode}}
              >
                <:label>{{t
                    "components.combined-course-blueprints.labels.reward-requirements.entire-blueprint-criteria-option"
                  }}</:label>
              </PixRadioButton>

              <PixRadioButton
                name="subsetNumberChoice"
                @checked={{this.usesCappedTubesSelectionForCriteria}}
                @value="use-tubes-selection"
                {{on "change" this.toggleCriteriaSelectionMode}}
              >
                <:label>{{t
                    "components.combined-course-blueprints.labels.reward-requirements.capped-tubes-selection-option"
                  }}</:label>
              </PixRadioButton>

              <PixRadioButton
                name="subsetNumberChoice"
                checked={{if
                  (and (not this.usesAllTargetProfilesForCriteria) (not this.usesCappedTubesSelectionForCriteria))
                  "checked"
                }}
                @value="no-criteria"
                {{on "change" this.toggleCriteriaSelectionMode}}
              >
                <:label>{{t
                    "components.combined-course-blueprints.labels.reward-requirements.no-criteria-option"
                  }}</:label>
              </PixRadioButton>
            </fieldset>

            {{#if this.usesCappedTubesSelectionForCriteria}}
              {{#each this.cappedTubeRequirements as |criterion index|}}
                <CappedTubesCriterion
                  @id={{concat "cappedTubeCriterion" index}}
                  @title={{t "components.combined-course-blueprints.labels.reward-requirements.capped-tubes-criteria"}}
                  @areas={{@areas}}
                  @onThresholdChange={{fn this.onCappedTubesThresholdChange criterion}}
                  @onNameChange={{fn this.onCappedTubesNameChange criterion}}
                  @onTubesSelectionChange={{fn this.onCappedTubesSelectionChange criterion}}
                  @remove={{fn this.removeCappedTubeCriterion index}}
                  @displayExpandAllButtons={{true}}
                />
              {{/each}}
              <PixButton
                class="badge-form-criterion__add"
                @variant="primary"
                @size="small"
                @triggerAction={{this.addCappedTubeSubset}}
                @iconBefore="add"
              >
                {{t "components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection"}}
              </PixButton>
            {{else if this.usesAllTargetProfilesForCriteria}}
              <CampaignCriterion
                @onThresholdChange={{this.setSchemaThreshold}}
                @title={{t
                  "components.combined-course-blueprints.labels.reward-requirements.entire-blueprint-criteria"
                }}
              />
            {{/if}}
          {{/if}}
        {{/unless}}
      {{/if}}
    </Card>
  </template>
}
