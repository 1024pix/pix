import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CampaignArchivedBanner extends Component {
  @service store;
  @service notifications;
  @service intl;
  @service currentUser;

  @action
  async unarchiveCampaign() {
    try {
      const campaign = this.store.peekRecord('campaign', this.args.campaign.id);
      await campaign.unarchive();
    } catch (err) {
      this.notifications.sendError(this.intl.t('api-error-messages.global'));
    }
  }

  get displayUnarchiveButton() {
    const isCurrentUserAdmin = this.currentUser.prescriber.isAdminOfTheCurrentOrganization;
    const isCurrentUserOwnerOfTheCampaign = parseInt(this.currentUser.prescriber.id) === this.args.campaign.ownerId;
    const isCurrentUserAllowedToUnarchiveCampaign = isCurrentUserAdmin || isCurrentUserOwnerOfTheCampaign;

    return isCurrentUserAllowedToUnarchiveCampaign;
  }

  <template>
    {{#if @campaign.isArchived}}
      <div class="campaign-archived-banner">
        <div class="campaign-archived-banner__text">
          <FaIcon class="campaign-archived-banner__icon" @icon="box-archive" />
          <span>{{t "pages.campaign.archived"}}</span>
        </div>
        {{#if this.displayUnarchiveButton}}
          <PixButton @triggerAction={{this.unarchiveCampaign}} @variant="transparent-dark" @isBorderVisible={{true}}>
            {{t "pages.campaign.actions.unarchive"}}
          </PixButton>
        {{/if}}
      </div>
    {{/if}}
  </template>
}
