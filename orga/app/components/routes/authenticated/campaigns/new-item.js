import { action, computed } from '@ember/object';
import Component from '@ember/component';

export default class NewItem extends Component {
  campaign = null;
  targetProfiles = null;
  wantIdPix = false;

  @computed('wantIdPix')
  get notWantIdPix() {
    return !this.wantIdPix;
  }

  @action
  askLabelIdPix() {
    this.set('wantIdPix', true);
    this.set('campaign.idPixLabel', '');
  }

  @action
  doNotAskLabelIdPix() {
    this.set('wantIdPix', false);
    this.set('campaign.idPixLabel', null);
  }

  @action
  setSelectedTargetProfile(selectedTargetProfileId) {
    const selectedTargetProfile = this.targetProfiles
      .find((targetProfile) => targetProfile.get('id') === selectedTargetProfileId);
    this.campaign.set('targetProfile', selectedTargetProfile);
  }
}
