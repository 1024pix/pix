import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import campaignTutorial from 'mon-pix/static-data/campaign-tutorial';
import { inject as service } from '@ember/service';

export default Route.extend(SecuredRouteMixin, {

  currentUser: service(),

  campaignCode: null,
  tutorialPageId: 0,
  tutorial: campaignTutorial.tutorial,

  _setupPaging(numberOfPages, currentTutorialPageId) {
    const classOfTutorialPages = new Array(numberOfPages);
    classOfTutorialPages[currentTutorialPageId] = 'dot__active';
    return classOfTutorialPages;
  },

  model() {
    this.set('campaignCode', this.paramsFor('campaigns').campaign_code);
    const maxTutorialPageId = this.tutorial.length - 1;
    return {
      title: this.tutorial[this.tutorialPageId].title,
      icon: this.tutorial[this.tutorialPageId].icon,
      explanation: this.tutorial[this.tutorialPageId].explanation,
      showNextButton: this.tutorialPageId < maxTutorialPageId,
      paging: this._setupPaging(this.tutorial.length, this.tutorialPageId)
    };
  },

  actions: {
    async submit() {
      await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } });

      this.set('tutorialPageId', 0);
      return this.transitionTo('campaigns.start-or-resume', this.campaignCode, {
        queryParams: {
          hasSeenLanding: true,
          hasJustConsultedTutorial: true
        }
      });
    },

    next() {
      const nextTutorialPageId = this.tutorialPageId + 1;
      if (nextTutorialPageId < this.tutorial.length) {
        this.set('tutorialPageId', nextTutorialPageId);
        this.refresh();
      }
    }
  }
});
