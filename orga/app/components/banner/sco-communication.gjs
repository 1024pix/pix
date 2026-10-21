import { service } from '@ember/service';
import Component from '@glimmer/component';
import ScoBanner from 'pix-orga/components/banner/sco-banner';

export default class ScoCommunicationBanner extends Component {
  @service currentUser;
  @service router;
  @service store;
  @service locale;

  get shouldDisplayBanner() {
    return (
      [
        'authenticated.campaigns.combined-courses',
        'authenticated.campaigns.list.my-campaigns',
        'authenticated.campaigns.list.all-campaigns',
        'authenticated.team.list.members',
        'authenticated.sco-organization-participants.list',
      ].includes(this.router.currentRouteName) &&
      this.currentUser.isSCOManagingStudents &&
      this.scoBannerContent
    );
  }

  get scoBannerContent() {
    const content = this.store.peekRecord('announcement', 'SCO')?.content;
    return content?.[this.locale.currentLocale] ?? null;
  }

  <template>
    {{#if this.shouldDisplayBanner}}
      <ScoBanner @content={{this.scoBannerContent}} />
    {{/if}}
  </template>
}
