import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SessionFinalizationExaminerGlobalCommentStep extends Component {
  @tracked displayExaminerGlobalCommentTextArea = false;

  @action
  toggleDisplayExaminerGlobalCommentTextArea(shouldDisplayTextArea) {
    if (!shouldDisplayTextArea) {
      this.args.session.examinerGlobalComment = null;
    }
    this.displayExaminerGlobalCommentTextArea = shouldDisplayTextArea;
  }
}
