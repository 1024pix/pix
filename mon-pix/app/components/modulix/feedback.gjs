import Component from '@glimmer/component';

export default class ModulixFeedback extends Component {
  get type() {
    return this.args.answerIsValid ? 'success' : 'error';
  }

  <template>
    <div class="feedback feedback--{{this.type}}">
      {{yield}}
    </div>
  </template>
}
