import Component from '@glimmer/component';

export default class AnswerFeedback extends Component {
  get title() {
    if (this.args.answer?.result === 'ok') {
      return 'Tu as réussi !';
    } else if (this.args.answer?.result === 'aband') {
      return 'Tu es sûr de vouloir passer ?';
    }
    return 'Ce n’est pas la bonne réponse';
  }
}
