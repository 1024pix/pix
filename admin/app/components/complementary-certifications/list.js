import Component from '@glimmer/component';

export default class List extends Component {
  get sortedComplementaryCertifications() {
    return this.args.complementaryCertifications.sortBy('label');
  }
}
