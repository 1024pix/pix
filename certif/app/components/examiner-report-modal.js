import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ExaminerReportModal extends Component {
  @service store

  reportOfTypeOther = this.args.report.examinerComment;

  @tracked
  isReportOfTypeOtherChecked = false

  @tracked
  reportLength = 0

  @action
  async toggleShowReportOfTypeOther() {
    this.isReportOfTypeOtherChecked = !this.isReportOfTypeOtherChecked;
    if (this.args.report.examinerComment) {
      this.reportLength = this.args.report.examinerComment.length;
    }
  }

  @action
  submitReport() {
    this.args.report.examinerComment = this.reportOfTypeOther;
    this.args.closeModal();
  }

  @action
  handleChange(e) {
    this.reportLength = e.target.value.length;
  }
}
