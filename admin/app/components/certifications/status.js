import Component from '@glimmer/component';
import includes from 'lodash/includes';
import { ERROR, STARTED } from 'pix-admin/models/certification';
import { ENDED_BY_SUPERVISOR } from 'pix-admin/models/jury-certification-summary';

export default class CertificationStatusComponent extends Component {
  get isStatusBlocking() {
    const blokingStatuses = [STARTED, ERROR, ENDED_BY_SUPERVISOR];
    return includes(blokingStatuses, this.args.record.status) || this.args.record.isFlaggedAborted;
  }
}
