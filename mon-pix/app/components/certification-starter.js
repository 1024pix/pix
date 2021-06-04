import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CertificationJoiner extends Component {
  @service store;
  @service router;
  @service currentUser;
  @service intl;

  @tracked isLoading = false;
  @tracked inputAccessCode = null;
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
    this.isLoading = true;

    const newCertificationCourse = this.store.createRecord('certification-course', {
      accessCode: this.accessCode,
      sessionId: this.args.sessionId,
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
      } else {
        this.errorMessage = this.intl.t('pages.certification-start.error-messages.generic');
      }
      this.isLoading = false;
    }
  }
}
