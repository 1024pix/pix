import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';

export default class SessionCandidates extends Component {
  @service intl;

  @action
  computedSubscriptionLabel(candidate) {
    const subscriptionName = this.intl.t(`pages.sessions.candidates.subscriptions.${candidate.subscription}`);
    if (!candidate.hasCoreScopedSubscription) {
      const pixPlusLabelFormat = this.args.sessionVersion === 3 ? 'pix-plus' : 'complementary';
      return this.intl.t(`pages.sessions.candidates.pix-plus-format.${pixPlusLabelFormat}`, {
        pixPlusLabel: subscriptionName,
      });
    }
    return subscriptionName;
  }

  <template>
    {{#if @certificationCandidates}}
      <PixTable @data={{@certificationCandidates}} @variant="admin" @caption={{t "pages.sessions.candidates.caption"}}>
        <:columns as |candidate context|>
          <PixTableColumn @context={{context}} class="table__column--small">
            <:header>
              {{t "pages.sessions.candidates.candidate.id"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.candidates.timeline" @model={{candidate.id}}>
                {{candidate.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column--small">
            <:header>
              {{t "pages.sessions.candidates.candidate.lastname"}}
            </:header>
            <:cell>
              {{candidate.lastName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column--small">
            <:header>
              {{t "pages.sessions.candidates.candidate.firstname"}}
            </:header>
            <:cell>
              {{candidate.firstName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column--small">
            <:header>
              {{t "pages.sessions.candidates.candidate.birth-date"}}
            </:header>
            <:cell>
              {{#if candidate.birthdate}}
                {{formatDate candidate.birthdate}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table__column">
            <:header>
              <span class="certification-candidates-table__selected-subscriptions">
                {{t "pages.sessions.candidates.candidate.selected-subscriptions"}}
              </span>
            </:header>
            <:cell>
              {{this.computedSubscriptionLabel candidate}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty content-text">
        <p>{{t "pages.sessions.candidates.empty-result"}}</p>
      </div>
    {{/if}}
  </template>
}
