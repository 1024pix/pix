import Component from '@glimmer/component';

export default class OtherCertificationissueReportFields extends Component {
  get reportLength() {
    return this.args.lateOrLeavingCategory.description
      ? this.args.lateOrLeavingCategory.description.length
      : 0;
  }
}
