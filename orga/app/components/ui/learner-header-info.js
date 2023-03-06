import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

const CONNECTION_TYPES = {
  empty: 'pages.sco-organization-participants.connection-types.empty',
  none: 'pages.sco-organization-participants.connection-types.none',
  email: 'pages.sco-organization-participants.connection-types.email',
  identifiant: 'pages.sco-organization-participants.connection-types.identifiant',
  mediacentre: 'pages.sco-organization-participants.connection-types.mediacentre',
};
export default class LearnerHeaderInfo extends Component {
  @service intl;
  constructor() {
    super(...arguments);
  }

  get group() {
    return this.args.organizationLearner.division;
  }
  get connectionMethods() {
    const connectionMethodsList = [];

    const learner = this.args.organizationLearner;
    if (learner) {
      if (learner.email) connectionMethodsList.push(this.intl.t(CONNECTION_TYPES['email']));
      if (learner.username) connectionMethodsList.push(this.intl.t(CONNECTION_TYPES['identifiant']));
      if (learner.authenticationMethods.includes('GAR'))
        connectionMethodsList.push(this.intl.t(CONNECTION_TYPES['mediacentre']));
      if (connectionMethodsList.length === 0) connectionMethodsList.push(this.intl.t(CONNECTION_TYPES['empty']));
    }

    return connectionMethodsList.join(', ');
  }
}
