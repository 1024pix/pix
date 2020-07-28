/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */

import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(SecuredRouteMixin, {

  currentUser: service(),
  intl: service(),

  campaignCode: null,
  tutorialPageId: 0,
  tutorialPageCount: 4,

  _setupPaging(numberOfPages, currentTutorialPageId) {
    const classOfTutorialPages = new Array(numberOfPages);
    classOfTutorialPages[currentTutorialPageId] = 'dot__active';
    return classOfTutorialPages;
  },

  model() {
    this.campaignCode = this.paramsFor('campaigns').code;
    const maxTutorialPageId = this.tutorialPageCount - 1;
    return {
      title: this.intl.t(`pages.tutorial.pages.page${this.tutorialPageId}.title`),
      icon: this.intl.t(`pages.tutorial.pages.page${this.tutorialPageId}.icon`),
      explanation: this.intl.t(`pages.tutorial.pages.page${this.tutorialPageId}.explanation`),
      showNextButton: this.tutorialPageId < maxTutorialPageId,
      paging: this._setupPaging(this.tutorialPageCount, this.tutorialPageId)
    };
  },

  actions: {
    async submit() {
      await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } });

      this.tutorialPageId = 0;
      return this.transitionTo('campaigns.assessment.start-or-resume', this.campaignCode, {
        queryParams: {
          hasConsultedTutorial: true
        }
      });
    },

    next() {
      const nextTutorialPageId = this.tutorialPageId + 1;
      if (nextTutorialPageId < this.tutorialPageCount) {
        this.tutorialPageId = nextTutorialPageId;
        this.refresh();
      }
    }
  }
});
