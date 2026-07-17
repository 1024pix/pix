import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  @service intl;
  get links() {
    return [
      {
        route: 'authenticated.certification-centers.list',
        label: this.intl.t('pages.certification-centers.breadcrumb.parent-page'),
      },
      {
        label: this.args.currentPageLabel,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
