import { PixInput, PixSelect, PixTextarea } from '@1024pix/nebulix-ember';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Card from '../../card';

export default class GeneralInfoSection extends Component {
  @action
  setData(key, e) {
    this.args.blueprint[key] = e.target.value;
  }

  @action
  setDurationOption(durationOption) {
    this.args.blueprint.durationSpan = durationOption;
  }

  <template>
    <Card
      class="combined-course-blueprint-form__card"
      @title={{t "components.combined-course-blueprints.create.generalInfoCardTitle"}}
    >
      <PixInput
        @id="internalName"
        @value={{@blueprint.internalName}}
        @requiredLabel={{t "common.forms.mandatory"}}
        {{on "change" (fn this.setData "internalName")}}
      >
        <:label>
          {{t "components.combined-course-blueprints.labels.internal-name"}}
        </:label>
      </PixInput>

      <PixInput
        @id="name"
        @value={{@blueprint.name}}
        @requiredLabel={{t "common.forms.mandatory"}}
        {{on "change" (fn this.setData "name")}}
        @subLabel="Ce titre sera visible par les utilisateurs"
      >
        <:label>
          {{t "components.combined-course-blueprints.labels.name"}}
        </:label>
      </PixInput>

      <PixInput @id="illustration" @value={{@blueprint.illustration}} {{on "change" (fn this.setData "illustration")}}>
        <:label>
          {{t "components.combined-course-blueprints.labels.illustration"}}

        </:label>
      </PixInput>

      <PixTextarea
        @id="description"
        @value={{@blueprint.description}}
        @requiredLabel={{t "common.forms.mandatory"}}
        {{on "change" (fn this.setData "description")}}
        rows="10"
        @subLabel={{t "components.combined-course-blueprints.labels.description-sublabel"}}
      >
        <:label>
          {{t "components.combined-course-blueprints.labels.description"}}
        </:label>
      </PixTextarea>

      <PixTextarea
        @id="prescriber-description"
        @value={{@blueprint.prescriberDescription}}
        @requiredLabel={{t "common.forms.mandatory"}}
        {{on "change" (fn this.setData "prescriberDescription")}}
        rows="10"
        @subLabel={{t "components.combined-course-blueprints.labels.prescriber-description-sublabel"}}
      >
        <:label>
          {{t "components.combined-course-blueprints.labels.prescriber-description"}}
        </:label>
      </PixTextarea>

      {{#if @blueprint.durationOptions}}
        <PixSelect
          size="small"
          @options={{@blueprint.durationOptions}}
          @value={{@blueprint.durationSpan}}
          @onChange={{this.setDurationOption}}
          @texts={{hash placeholder=(t "components.combined-course-blueprints.combined-course-duration.placeholder")}}
        >
          <:label>
            {{t "components.combined-course-blueprints.combined-course-duration.label"}}
          </:label>
        </PixSelect>
      {{/if}}

      <PixInput
        @id="surveyLink"
        @value={{@blueprint.surveyLink}}
        {{on "change" (fn this.setData "surveyLink")}}
        rows="10"
      >
        <:label>
          {{t "components.combined-course-blueprints.labels.survey-link"}}
        </:label>
      </PixInput>

    </Card>
  </template>
}
