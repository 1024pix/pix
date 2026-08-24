import { PixBlock } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class List extends Component {
  @service currentUser;

  get isNotManagingStudents() {
    return !this.currentUser.isSCOManagingStudents && !this.currentUser.isSUPManagingStudents;
  }

  <template>
    <PixBlock class="no-participant-panel" @variant="orga">
      <img src="{{this.rootURL}}/images/empty-state-participants.svg" alt="" role="none" />
      <p class="content-text">
        {{t "pages.organization-participants.empty-state.message"}}
        {{#if this.isNotManagingStudents}}
          <br />
          {{t "pages.organization-participants.empty-state.call-to-action"}}
          <LinkTo @route="authenticated.campaigns.list.my-campaigns" class="link link--underlined">
            {{t "pages.organization-participants.empty-state.action"}}
          </LinkTo>
        {{/if}}
      </p>
    </PixBlock>
  </template>
}
