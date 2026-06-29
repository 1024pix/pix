import PixLabel from '@1024pix/pix-ui/components/pix-label';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CandidateCreationModalComplementaryList extends Component {
  @service currentUser;
  @service intl;

  fieldsetLegend = () => {
    return this.intl.t(`common.forms.certification-labels.additional-certification`);
  };

  firstInputLabel = () => {
    return this.intl.t('common.forms.certification-labels.subscriptions.CORE');
  };

  subscriptionLabel = (complementaryCertificationHabilitation) => {
    return this.intl.t(`common.forms.certification-labels.subscriptions.${complementaryCertificationHabilitation.key}`);
  };

  <template>
    <div class='new-candidate-modal-form__field'>
      <fieldset id='complementary-certifications'>
        <legend class='label'>
          <PixLabel @requiredLabel={{t 'common.forms.required'}}>
            {{this.fieldsetLegend}}
          </PixLabel>
        </legend>
        <PixRadioButton required name='subscription' {{on 'change' (fn @updateSubscription 'CORE')}}>
          <:label>{{this.firstInputLabel}}</:label>
        </PixRadioButton>
        {{#each @complementaryCertificationsHabilitations as |complementaryCertificationHabilitation|}}
          <PixRadioButton
            required
            name='subscription'
            {{on 'change' (fn @updateSubscription complementaryCertificationHabilitation.key)}}
          >
            <:label>{{this.subscriptionLabel complementaryCertificationHabilitation}}</:label>
          </PixRadioButton>
        {{/each}}
      </fieldset>
    </div>
  </template>
}
