import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import TrainingCard from '../../../../training/card';

export default class EvaluationResultsTabsTrainings extends Component {
  @service currentUser;
  @service store;

  @tracked isShareResultsLoading = false;
  @tracked isShareResultsError = false;

  @action
  async shareResults() {
    const adapter = this.store.adapterFor('campaign-participation-result');

    try {
      this.isShareResultsError = false;
      this.isShareResultsLoading = true;

      await adapter.share(this.args.campaignParticipationResultId);

      await this.store.queryRecord(
        'campaign-participation-result',
        {
          campaignId: this.args.campaignId,
          userId: this.currentUser.user.id,
        },
        { reload: true },
      );
    } catch {
      this.isShareResultsError = true;
    } finally {
      this.isShareResultsLoading = false;
    }
  }

  <template>
    <div
      class="evaluation-results-tab__trainings
        {{unless @isParticipationShared 'evaluation-results-tab__trainings--with-modal'}}"
    >
      <div
        class="evaluation-results-tab__trainings-content"
        inert={{unless @isParticipationShared "true"}}
        role={{unless @isParticipationShared "presentation"}}
      >
        <h2 class="evaluation-results-tab__title">{{t "pages.skill-review.tabs.trainings.title"}}</h2>
        <p class="evaluation-results-tab__description">{{t "pages.skill-review.tabs.trainings.description"}}</p>

        <ul class="evaluation-results-tab__trainings-list">
          {{#each @trainings as |training|}}
            <li class="evaluation-results-tab__training">
              <TrainingCard @training={{training}} />
            </li>
          {{/each}}
        </ul>
      </div>

      {{#unless @isParticipationShared}}
        <div class="evaluation-results-tab__share-results-modal" role="dialog">
          <div class="evaluation-results-tab-share-results-modal__content">
            <p>{{t "pages.skill-review.tabs.trainings.modal.content" htmlSafe=true}}</p>
            <PixButton @triggerAction={{this.shareResults}} @isLoading={{this.isShareResultsLoading}}>
              {{t "pages.skill-review.actions.send"}}
            </PixButton>
            {{#if this.isShareResultsError}}
              <PixMessage @type="error" @withIcon={{true}}>
                {{t "pages.skill-review.tabs.trainings.modal.share-error"}}
              </PixMessage>
            {{/if}}
          </div>
        </div>
      {{/unless}}
    </div>
  </template>
}
