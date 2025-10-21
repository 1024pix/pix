import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import Component from '@glimmer/component';
import { arg, forbidExtraArgs } from 'ember-arg-types';
import { string } from 'prop-types';

@forbidExtraArgs
export default class Breadcrumb extends Component {
  @arg(string.isRequired)
  currentPageLabel;

  get links() {
    return [
      {
        route: 'authenticated.organizations.list',
        label: 'Toutes les organisations',
      },
      {
        label: this.currentPageLabel,
      },
    ];
  }

  <template><PixBreadcrumb @links={{this.links}} class="breadcrumb" /></template>
}
