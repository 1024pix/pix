import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import BadgesList from '../target-profiles/badges-list';
import History from '../target-profiles/history';
import Information from '../target-profiles/information';

export default class TargetProfile extends Component {
  @service router;
  @service store;

  @tracked complementaryCertification;
  @tracked isToggleSwitched = true;
  @tracked targetProfileId;

  constructor() {
    super(...arguments);
    this.#onMount();
  }

  async #onMount() {
    const currentComplementaryCertificationId = this.router.currentRoute.parent.params.complementary_certification_id;
    this.complementaryCertification = await this.store.peekRecord(
      'complementary-certification',
      currentComplementaryCertificationId,
    );

    this.targetProfileId = this.complementaryCertification?.currentTargetProfiles?.[0].id;
  }

  get currentTargetProfile() {
    return this.complementaryCertification?.currentTargetProfiles?.find(({ id }) => id === this.targetProfileId);
  }

  @action
  switchTargetProfile() {
    this.isToggleSwitched = !this.isToggleSwitched;
    this.targetProfileId = this.complementaryCertification.currentTargetProfiles?.find(
      ({ id }) => id !== this.targetProfileId,
    ).id;
  }

  <template>
    <Information
      @complementaryCertification={{this.complementaryCertification}}
      @currentTargetProfile={{this.currentTargetProfile}}
      @switchTargetProfile={{this.switchTargetProfile}}
      @switchToggle={{this.isToggleSwitched}}
    />
    <BadgesList @currentTargetProfile={{this.currentTargetProfile}} />
    <History @targetProfilesHistory={{this.complementaryCertification.targetProfilesHistory}} />
  </template>
}
