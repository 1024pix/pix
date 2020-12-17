import Component from '@glimmer/component';

export default class OtherCertificationissueReportFields extends Component {
  get reportLength() {
    return this.args.otherCategory.description
      ? this.args.otherCategory.description.length
      : 0;
  }
}
