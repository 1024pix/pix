import Component from '@glimmer/component';
// import { computed } from '@ember/object';

export default class OtherCertificationissueReportFields extends Component {
  // @computed('args.otherCategory.description.length')
  get reportLength() {
    return this.args.otherCategory.description
      ? this.args.otherCategory.description.length
      : 0;
  }
}
