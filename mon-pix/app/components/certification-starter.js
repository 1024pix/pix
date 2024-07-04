import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CertificationJoiner extends Component {
  @service store;
  @service router;
  @service currentUser;
  @service intl;
  @service focusedCertificationChallengeWarningManager;
  @service windowPostMessage;

  @tracked inputAccessCode = '';
  @tracked errorMessage = null;
  @tracked classNames = [];
  @tracked certificationCourse = null;

  get accessCode() {
    return this.inputAccessCode.toUpperCase();
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
      this.focusedCertificationChallengeWarningManager.reset();
      this.router.replaceWith('authenticated.certifications.resume', newCertificationCourse.id);
      this.windowPostMessage.startCertification();
    } catch (err) {
      newCertificationCourse.deleteRecord();
      const statusCode = err.errors?.[0]?.status;
      if (statusCode === '404') {
        this.errorMessage = this.intl.t('pages.certification-start.error-messages.access-code-error');
      } else if (statusCode === '412') {
        this.errorMessage = this.intl.t('pages.certification-start.error-messages.session-not-accessible');
      } else if (statusCode === '403') {
        const errorCode = err.errors?.[0]?.code;
        if (errorCode === 'CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION') {
          this.errorMessage = this.intl.t('pages.certification-start.error-messages.candidate-not-authorized-to-start');
        } else if (errorCode === 'CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION') {
          this.errorMessage = this.intl.t(
            'pages.certification-start.error-messages.candidate-not-authorized-to-resume',
          );
        }
      } else {
        this.errorMessage = this.intl.t('pages.certification-start.error-messages.generic');
      }
    }
  }
}
