import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  get links() {
    return this.args.links.map((link, index) => ({
      ...link,
      label: link.label?.trim(),
      ariaCurrent: index === this.args.links.length - 1 ? 'page' : false,
    }));
  }
}
