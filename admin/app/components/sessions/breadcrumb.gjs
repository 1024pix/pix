import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  get links() {
    return [
      {
        route: 'authenticated.sessions.list',
        label: 'Toutes les sessions de certification',
      },
      {
        label: `Session ${this.args.sessionId}`,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
