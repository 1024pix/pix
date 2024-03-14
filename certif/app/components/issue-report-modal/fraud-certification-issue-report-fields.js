import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class FraudCertificationIssueReportFields extends Component {
  @service url;

  get fraudFormUrl() {
    return this.url.fraudFormUrl;
  }
}
