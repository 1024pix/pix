import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <div class='new-candidate-modal-form__field'>
    <fieldset id='complementary-certifications'>
      <legend class='label'>
        {{t 'common.forms.certification-labels.additional-certification'}}
      </legend>
      <PixRadioButton name='complementary-certifications' {{on 'change' (fn @updateComplementaryCertification null)}}>
        <:label>{{t 'common.labels.candidate.none'}}</:label>
      </PixRadioButton>
      {{#each @complementaryCertificationsHabilitations as |complementaryCertificationHabilitation|}}
        <PixRadioButton
          name='complementary-certifications'
          {{on 'change' (fn @updateComplementaryCertification complementaryCertificationHabilitation)}}
        >
          <:label>{{complementaryCertificationHabilitation.label}}</:label>
        </PixRadioButton>
      {{/each}}
    </fieldset>
  </div>
</template>
