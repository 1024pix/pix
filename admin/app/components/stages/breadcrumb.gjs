import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  get links() {
    return [
      {
        route: 'authenticated.target-profiles.target-profile.insights',
        label: this.args.targetProfileName,
      },
      {
        label: `Palier ${this.args.stageId}`,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
