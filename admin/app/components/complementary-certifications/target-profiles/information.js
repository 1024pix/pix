import Component from '@glimmer/component';

export default class Information extends Component {
  get isMultipleCurrentTargetProfiles() {
    return this.args.complementaryCertification.currentTargetProfiles?.length > 1;
  }
}
