import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Header extends Component {
  @service url;

  get showcase() {
    return this.url.showcase;
  }

  <template>
    <header class="authentication-layout-header" role="banner">
      <a href={{this.showcase.url}} class="pix-logo__link">
        <img class="pix-logo__image" src="/images/pix-logo.svg" alt="{{this.showcase.linkText}}" />
      </a>
      {{yield}}
    </header>
  </template>
}
