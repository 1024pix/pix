import Component from '@glimmer/component';

// Bug known : carriages return under Safari in textareas
// are '\r\n' so the browser counts it as 2 characters
export default class SessionFinalizationExaminerCommentStep extends Component {

  constructor() {
    super(...arguments);

    this.textareaMaxLength = 500;
  }
}
