import { PixSelect } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class SelectAttestation extends Component {
  get attestationsOptions() {
    return this.args.attestations?.map((attestation) => ({ value: attestation.id, label: attestation.label })) ?? [];
  }

  <template>
    <PixSelect
      size="small"
      @options={{this.attestationsOptions}}
      @value={{@value}}
      @onChange={{@onChange}}
      @placeholder={{t "components.combined-course-blueprints.attestation.select-placeholder"}}
    >
      <:label>
        {{t "components.combined-course-blueprints.attestation.select-label"}}
      </:label>
    </PixSelect>
  </template>
}
