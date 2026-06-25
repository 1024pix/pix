import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import BadgesList from './target-profile/badges-list';
import History from './target-profile/history';
import Information from './target-profile/information';

export default class TargetProfile extends Component {
  @tracked targetProfileId;

  constructor() {
    super(...arguments);
    this.#onMount();
  }

  #onMount() {
    this.targetProfileId = this.args.complementaryCertification?.currentTargetProfiles?.[0].id;
  }

  get currentTargetProfile() {
    return this.args.complementaryCertification?.currentTargetProfiles?.find(({ id }) => id === this.targetProfileId);
  }

  <template>
    {{#unless @complementaryCertification.hasComplementaryReferential}}
      <Information
        @complementaryCertification={{@complementaryCertification}}
        @currentTargetProfile={{this.currentTargetProfile}}
      />
      <BadgesList @currentTargetProfile={{this.currentTargetProfile}} />
    {{/unless}}
    <History @targetProfilesHistory={{@complementaryCertification.targetProfilesHistory}} />
  </template>
}
