import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class ScommunicationBanner extends Component {
  @service currentUser;
  @service router;

  get shouldDisplayBanner() {
    return (
      [
        'authenticated.campaigns.list.my-campaigns',
        'authenticated.campaigns.list.all-campaigns',
        'authenticated.team.list.members',
        'authenticated.sco-organization-participants.list',
      ].includes(this.router.currentRouteName) && this.currentUser.isSCOManagingStudents
    );
  }
  get importParticipantUrl() {
    return this.router.urlFor('authenticated.import-organization-participants');
  }

  <template>
    {{#if this.shouldDisplayBanner}}
      <PixBanner @type="communication-orga">
        {{t "banners.import.message"}}
        <ol class="banner-list">
          <li>
            {{t "banners.import.step1a" htmlSafe=true}}
            <LinkTo
              @route="authenticated.import-organization-participants"
              class="link link--banner link--bold link--underlined"
            >
              {{t "banners.import.step1b"}}
            </LinkTo>
            {{t "banners.import.step1c"}}
          </li>
          <li>{{t "banners.import.step2" htmlSafe=true}}</li>
          <li>{{t "banners.import.step3" htmlSafe=true}}</li>
        </ol>
      </PixBanner>
    {{/if}}
  </template>
}
