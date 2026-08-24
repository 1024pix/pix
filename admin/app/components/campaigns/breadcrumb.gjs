import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  get links() {
    return [
      {
        route: 'authenticated.organizations.list',
        label: 'Toutes les organisations',
      },
      {
        route: 'authenticated.organizations.get',
        label: this.args.campaign.organizationName,
        model: this.args.campaign.organizationId,
      },
      {
        label: `Campagne ${this.args.campaign.name}`,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
