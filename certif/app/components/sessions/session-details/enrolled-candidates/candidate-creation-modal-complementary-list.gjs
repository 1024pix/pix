import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { COMPLEMENTARY_KEYS } from 'pix-certif/models/subscription';

export default class CandidateCreationModalComplementaryList extends Component {
  @service currentUser;
  @service intl;

  fieldsetLegend = () => {
    if (this.currentUser.currentAllowedCertificationCenterAccess.isCoreComplementaryCompatibilityEnabled) {
      return this.intl.t(`common.forms.certification-labels.additional-certification`);
    }
    return this.intl.t(`common.forms.certification-labels.additional-certification-old`);
  };

  firstInputLabel = () => {
    if (this.currentUser.currentAllowedCertificationCenterAccess.isCoreComplementaryCompatibilityEnabled) {
      return this.intl.t('common.forms.certification-labels.pix-certification');
    }

    return this.intl.t('common.labels.candidate.none');
  };

  complementaryLabel = (complementaryCertificationHabilitation) => {
    const { key, label } = complementaryCertificationHabilitation;
    if (
      this.currentUser.currentAllowedCertificationCenterAccess.isCoreComplementaryCompatibilityEnabled &&
      key === COMPLEMENTARY_KEYS.CLEA
    ) {
      return this.intl.t('common.forms.certification-labels.dual-certification-clea');
    }

    return label;
  };

  <template>
    <div class='new-candidate-modal-form__field'>
      <fieldset id='complementary-certifications'>
        <legend class='label'>
          <abbr title={{t 'common.forms.required'}} class='mandatory-mark' aria-hidden='true'>*</abbr>
          {{this.fieldsetLegend}}
        </legend>
        <PixRadioButton required name='subscriptions' {{on 'change' (fn @updateComplementaryCertification null)}}>
          <:label>{{this.firstInputLabel}}</:label>
        </PixRadioButton>
        {{#each @complementaryCertificationsHabilitations as |complementaryCertificationHabilitation|}}
          <PixRadioButton
            required
            name='subscriptions'
            {{on 'change' (fn @updateComplementaryCertification complementaryCertificationHabilitation)}}
          >
            <:label>{{this.complementaryLabel complementaryCertificationHabilitation}}</:label>
          </PixRadioButton>
        {{/each}}
      </fieldset>
    </div>
  </template>
}
