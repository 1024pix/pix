import { PixBreadcrumb } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Breadcrumb extends Component {
  @service router;

  get links() {
    const { localName } = this.router.currentRoute;

    const links = [
      {
        route: 'authenticated.target-profiles.list',
        label: 'Tous les profils cibles',
      },
    ];

    if (this.args.targetProfile) {
      let badgeRoute = '';

      if (localName === 'badge') {
        badgeRoute = '.insights';
      }

      links.push({
        route: `authenticated.target-profiles.target-profile${badgeRoute}`,
        model: this.args.targetProfile.id,
        label: this.args.targetProfile.internalName,
      });
    }

    links.push({
      label: this.args.currentPageLabel,
    });

    return links;
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
