import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CertificationJoiner extends Component {
  @service store;
  @service router;
  @service currentUser;
  @service intl;

  @tracked inputAccessCode = null;
  @tracked errorMessage = null;
  @tracked classNames = [];
  @tracked certificationCourse = null;

  get accessCode() {
    return this.inputAccessCode.toUpperCase();
  }

  get allComplementaryCertificationsLength() {
    return (
      this.args.certificationCandidateSubscription.eligibleSubscriptions.length +
      this.args.certificationCandidateSubscription.nonEligibleSubscriptions.length
    );
  }

  get nonEligibleSubscriptionNames() {
    return this.args.certificationCandidateSubscription.nonEligibleSubscriptions
      .map((nonEligibleSubscription) => nonEligibleSubscription.name)
      .join(', ');
  }

  get eligibleSubscriptionNames() {
    return this.args.certificationCandidateSubscription.eligibleSubscriptions
      .map((eligibleSubscription) => eligibleSubscription.name)
      .join(', ');
  }

  @action
  async submit(e) {
    e.preventDefault();
    this.errorMessage = null;
    if (!this.accessCode) {
      this.errorMessage = this.intl.t('pages.certification-start.error-messages.access-code-error');
      return;
    }

    const newCertificationCourse = this.store.createRecord('certification-course', {
      accessCode: this.accessCode,
      sessionId: this.args.certificationCandidateSubscription.sessionId,
    });
    try {
      await newCertificationCourse.save();
      this.router.replaceWith('certifications.resume', newCertificationCourse.id);
    } catch (err) {
      newCertificationCourse.deleteRecord();
      if (err.errors?.[0]?.status === '404') {
        this.errorMessage = this.intl.t('pages.certification-start.error-messages.access-code-error');
      } else if (err.errors?.[0]?.status === '412') {
        this.errorMessage = this.intl.t('pages.certification-start.error-messages.session-not-accessible');
      } else if (err.errors?.[0]?.status === '403') {
        this.errorMessage = err.errors[0].detail;
      } else {
        this.errorMessage = this.intl.t('pages.certification-start.error-messages.generic');
      }
    }
  }
}
