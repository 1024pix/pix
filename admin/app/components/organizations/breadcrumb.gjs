import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  @service intl;

  get links() {
    return [
      {
        route: 'authenticated.organizations.list',
        label: this.intl.t('pages.organizations.breadcrumb.parent-page'),
      },
      {
        label: this.args.currentPageLabel,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
