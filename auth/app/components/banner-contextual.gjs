import Component from '@glimmer/component';
import PixNavigation from '@1024pix/pix-ui/components/pix-navigation';

export default class BannerContextual extends Component {
  get contextualLogo() {
    return `/assets/contextual/${this.args.context}/logo-colorless.svg`;
  }

  <template>
    <PixNavigation
      @navigationAriaLabel="SideBar"
      @openLabel="ouvrir"
      @closeLabel="fermer"
    >
      <:brand>
        <img src={{this.contextualLogo}} alt="{{@context}}" />
      </:brand>
    </PixNavigation>
  </template>
}
