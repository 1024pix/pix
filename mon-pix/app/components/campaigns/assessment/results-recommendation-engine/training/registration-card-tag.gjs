import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class RegistrationCardTag extends Component {
  @service intl;

  get tagProperties() {
    const registrationRequired = this.args.registrationRequired;

    const color = registrationRequired ? 'blue-light' : 'purple';
    const iconName = registrationRequired ? 'lock' : 'acute';
    const translationKey = registrationRequired ? 'yes' : 'no';
    const text = this.intl.t(
      `pages.skill-review.recommended-engine.training-card.registration-required.${translationKey}`,
    );

    return {
      color,
      iconName,
      text,
    };
  }

  <template>
    <PixTag @color={{this.tagProperties.color}} class="results-recommendation-engine-training-card__tag">
      <PixIcon
        class="results-recommendation-engine-training-card__tag-icon"
        @name={{this.tagProperties.iconName}}
        @ariaHidden={{true}}
      />
      {{this.tagProperties.text}}
    </PixTag>
  </template>
}
