import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Steps extends Component {
  @service intl;
  @tracked pageId = 1;
  @tracked pageCount = 5;
  @tracked isConfirmationCheckboxChecked = false;
  @service router;

  _setupPaging(numberOfPages, currentPageId) {
    const classOfPages = new Array(numberOfPages);
    classOfPages[currentPageId - 1] = 'active';
    return classOfPages;
  }

  get title() {
    return this.intl.t(`pages.certification-instructions.steps.${this.pageId}.title`);
  }

  get paging() {
    return this._setupPaging(this.pageCount, this.pageId);
  }

  get showPreviousButton() {
    return this.pageId > 1;
  }

  get isNextButtonDisabled() {
    return !this.isConfirmationCheckboxChecked && this.pageId === this.pageCount;
  }

  get nextButtonAriaLabel() {
    const translationKey = this.pageId === this.pageCount ? 'last-page.aria-label' : 'aria-label';
    return this.intl.t(`pages.certification-instructions.buttons.continuous.${translationKey}`);
  }

  get vocalStepIdentifier() {
    return this.intl.t(`pages.certification-instructions.vocal-step-identifier`, {
      pageId: this.pageId,
      pageCount: this.pageCount,
    });
  }

  focus(element) {
    element.focus();
  }

  @action
  previousStep() {
    this.pageId = this.pageId - 1;
  }

  @action
  async nextStep() {
    if (this.pageId < this.pageCount) {
      this.pageId = this.pageId + 1;
    }

    if (this.isConfirmationCheckboxChecked) {
      await this.submit();

      this.router.transitionTo('authenticated.certifications.start', this.args.candidate.id);
    }
  }

  @action
  async submit() {
    await this.args.candidate.save({
      adapterOptions: {
        hasSeenCertificationInstructions: true,
      },
    });
  }

  @action
  enableNextButton(checked) {
    this.isConfirmationCheckboxChecked = checked;
  }
}
