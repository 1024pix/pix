import Component from '@glimmer/component';

export default class Information extends Component {
  get currentTargetProfile() {
    return this.args.complementaryCertification.targetProfilesHistory?.[0];
  }
}
