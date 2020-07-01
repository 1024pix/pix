import Component from '@glimmer/component';

export default class ConfirmPopup extends Component {

  get title() {
    return this.args.title || 'Merci de confirmer';
  }

  get closeTitle() {
    return this.args.closeTitle || 'Annuler';
  }

  get submitTitle() {
    return this.args.submitTitle || 'Confirmer';
  }
}
