import Component from '@glimmer/component';

export default class Section extends Component {
  get hasLink() {
    return this.args.linkRoute && this.args.linkText;
  }
}
