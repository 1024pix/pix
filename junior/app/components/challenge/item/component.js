import Component from '@glimmer/component';

export default class Item extends Component {
  get isMediaWithForm() {
    return this.args.challenge.hasForm && this.hasMedia && this.args.challenge.type !== undefined;
  }

  get hasMedia() {
    return (
      this.args.challenge.illustrationUrl ||
      this.args.challenge.hasValidEmbedDocument ||
      this.args.challenge.hasWebComponent
    );
  }
}
