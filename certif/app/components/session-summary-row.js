import Component from '@glimmer/component';
import { CREATED, FINALIZED, PROCESSED } from '../models/session';
import { inject as service } from '@ember/service';

export default class SessionSummaryRow extends Component {
  @service intl;
  get statusLabel() {
    const { status } = this.args.sessionSummary;
    if (status === FINALIZED) return this.intl.t(`pages.sessions.list.session-summary.status-label.${FINALIZED}`);
    if (status === PROCESSED) return this.intl.t(`pages.sessions.list.session-summary.status-label.${PROCESSED}`);
    return this.intl.t(`pages.sessions.list.session-summary.status-label.${CREATED}`);
  }
}
