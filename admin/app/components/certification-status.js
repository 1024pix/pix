import Component from '@glimmer/component';
import includes from 'lodash/includes';
import { STARTED, ERROR } from 'pix-admin/models/certification';

export default class CertificationStatusComponent extends Component {

  get isStatusBlocking() {
    const blokingStatuses = [STARTED, ERROR];
    return includes(blokingStatuses, this.args.record.status);
  }
}
