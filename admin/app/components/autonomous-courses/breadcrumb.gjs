import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  @service intl;

  get links() {
    return [
      {
        route: 'authenticated.autonomous-courses',
        label: this.intl.t(`components.autonomous-courses.title`),
      },
      {
        label: this.args.currentPageLabel,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
