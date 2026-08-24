import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  get links() {
    return [
      {
        route: 'authenticated.trainings.list',
        label: 'Tous les contenus formatifs',
      },
      {
        label: this.args.currentPageLabel,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
