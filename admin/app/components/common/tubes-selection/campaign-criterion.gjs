import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CampaignCriterion extends Component {
  get title() {
    return this.args.title ?? 'Critère d’obtention sur l’ensemble du profil cible';
  }

  <template>
    <section class="badge-form-criterion">
      <header>
        <h3>{{this.title}}</h3>
      </header>
      <PixInput
        @id="campaignThreshold"
        class="badge-form-criterion__threshold"
        type="number"
        min="0"
        max="100"
        @requiredLabel={{t "common.forms.mandatory"}}
        {{on "change" @onThresholdChange}}
      >
        <:label>Taux de réussite requis</:label>
      </PixInput>
    </section>
  </template>
}
