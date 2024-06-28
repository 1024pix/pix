import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import NoSessionPanel from './no-session-panel';
import PanelHeader from './panel-header';
import SessionSummaryList from './session-summary-list';

const DEFAULT_PAGE_NUMBER = 1;

export default class Sessions extends Component {
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @service currentUser;
  @service router;

  get displayNoSessionPanel() {
    return !this.args.sessionSummaries.meta.hasSessions;
  }

  @action
  goToSessionDetails(sessionId) {
    this.router.transitionTo('authenticated.sessions.details', sessionId);
  }

  <template>
    <div class='session-list-page'>
      {{#if this.displayNoSessionPanel}}
        <NoSessionPanel />
      {{else}}
        <PanelHeader />

        <SessionSummaryList @sessionSummaries={{@sessionSummaries}} @goToSessionDetails={{this.goToSessionDetails}} />
      {{/if}}
    </div>
  </template>
}
