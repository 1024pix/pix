import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

const LEVEL_SEVEN = 7;

export default class ProfileContent extends Component {
  @service intl;
  @service url;

  get lvlSevenInformation() {
    return this.intl.t('common.new-information-banner.lvl-seven', { lvlSevenUrl: this.lvlSevenUrl });
  }

  get lvlSevenUrl() {
    return this.url.levelSevenNewsUrl;
  }

  get maxReachableLevel() {
    return this.args.model.profile.get('maxReachableLevel');
  }

  get displayLevelSevenBanner() {
    return this.maxReachableLevel === LEVEL_SEVEN && !this.args.model.hasSeenLevelSevenInfo;
  }

  @action
  async closeLevelSevenBanner(event) {
    event.preventDefault();
    await this.args.model.save({ adapterOptions: { rememberUserHasSeenLevelSevenBanner: true } });
  }
}
