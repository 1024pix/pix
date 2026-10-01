import { PixButtonLink } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import UserLoggedMenu from '../user-logged-menu';

export default class AppMainHeader extends Component {
  @service currentUser;

  get userPixScore() {
    return this.currentUser.user.profile.get('pixScore');
  }

  <template>
    <header class="app-main-header" ...attributes>
      <LinkTo
        class="app-main-header__user-pix-score"
        @route="authenticated.profile"
        title={{t "pages.dashboard.empty-dashboard.link-to-competences"}}
      >
        <img src="/images/icons/icon-pix-score.svg" alt="" />
        <span>{{this.userPixScore}}&nbsp;Pix</span>
      </LinkTo>
      <PixButtonLink
        class="app-main-header__campaign-code-button"
        @route="fill-in-campaign-code"
        title={{t "pages.fill-in-campaign-code.start"}}
      >
        {{t "navigation.main.code"}}
      </PixButtonLink>
      <UserLoggedMenu />
    </header>
  </template>
}
