import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class RecommendationButton extends Component {
  @service intl;

  get onSeeRecommendationButtonLabel() {
    return this.args.highlightedTraining
      ? this.intl.t('pages.skill-review.hero.see-my-other-recommendations')
      : this.intl.t('pages.skill-review.hero.see-my-recommendations');
  }

  @action
  onSeeRecommendationsButtonClicked() {
    this.args.onSeeRecommendationsButtonClicked();
  }

  <template>
    <PixButton @triggerAction={{this.onSeeRecommendationsButtonClicked}} @size="small" @variant="secondary-white">
      {{this.onSeeRecommendationButtonLabel}}
    </PixButton>
  </template>
}
