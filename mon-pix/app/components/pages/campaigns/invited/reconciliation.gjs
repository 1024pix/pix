import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import LearnerReconciliation from '../../../campaigns/invited/learner-reconciliation';

export default class InvitedWrapper extends Component {
  @service store;
  @service campaignStorage;
  @service router;
  @service intl;

  @tracked isLoading = false;
  @tracked errorMessage = null;

  @action
  async registerLearner(reconciliationInfos) {
    this.isLoading = true;
    this.errorMessage = null;
    const organizationLearner = this.store.createRecord('organization-learner', {
      campaignCode: this.args.model.code,
      reconciliationInfos,
    });

    try {
      await organizationLearner.save();

      this.campaignStorage.set(this.args.model.code, 'associationDone', true);
      return this.router.transitionTo('campaigns.invited.fill-in-participant-external-id', this.args.model.code);
    } catch (errorResponse) {
      this.handleError(errorResponse);
    } finally {
      this.isLoading = false;
      organizationLearner.unloadRecord();
    }
  }

  handleError(errorResponse) {
    if (!errorResponse.errors) throw errorResponse;
    errorResponse.errors.forEach((error) => {
      if (error.status === '400') {
        this.errorMessage = this.intl.t(
          'components.invited.reconciliation.error-message.invalid-reconciliation-error',
          { fields: this.reconciliationFieldNames.join(', ') },
        );
      } else {
        this.errorMessage = error.detail;
      }
    });
  }
  get reconciliationFieldNames() {
    return this.args.model.reconciliationFields.map(({ columnName }) => columnName);
  }

  <template>
    <main role="main">
      <LearnerReconciliation
        @organizationName={{@model.organizationName}}
        @reconciliationFields={{@model.reconciliationFields}}
        @reconciliationError={{this.errorMessage}}
        @onSubmit={{this.registerLearner}}
        @isLoading={{this.isLoading}}
      />
    </main>
  </template>
}
