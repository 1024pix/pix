import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  get links() {
    return [
      {
        route: 'authenticated.users.list',
        label: 'Tous les utilisateurs',
      },
      {
        label: `Utilisateur ${this.args.userId}`,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
