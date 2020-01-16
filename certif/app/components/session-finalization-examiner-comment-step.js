import Component from '@glimmer/component';
import { action } from '@ember/object';

// Bug known : carriages return under Safari in textareas
// are '\r\n' so the browser counts it as 2 characters
export default class SessionFinalizationExaminerCommentStep extends Component {

  constructor() {
    super(...arguments);

    this.textareaMaxLength = 500;
  }

  @action
  updateTextareaValue(text) {
    if (text.length <= this.textareaMaxLength) {
      this.args.session.set('examinerComment', text);
    }
  }
}
