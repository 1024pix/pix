import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class FraudCertificationIssueReportFields extends Component {
  @service url;

  get fraudFormUrl() {
    return this.url.fraudFormUrl;
  }
}
