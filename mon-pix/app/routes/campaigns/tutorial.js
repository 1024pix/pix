import BaseRoute from 'mon-pix/routes/base-route';
import campaignTutorial from 'mon-pix/models/campaign-tutorial';

export default BaseRoute.extend({

  campaignCode: null,
  tutorialPageId: 0,
  campaignTutorial: campaignTutorial,

  _setupPaging(numberOfPages, currentTutorialPageId) {
    const classOfTutorialPages = new Array(numberOfPages);
    classOfTutorialPages[currentTutorialPageId] = 'dot__active';
    return classOfTutorialPages;
  },

  model(params) {
    this.set('campaignCode', params.campaign_code);
    const maxTutorialPageId = campaignTutorial.tutorial.length -1;
    return {
      title: this.campaignTutorial.tutorial[this.tutorialPageId].title,
      icon: this.campaignTutorial.tutorial[this.tutorialPageId].icon,
      explanation: this.campaignTutorial.tutorial[this.tutorialPageId].explanation,
      showNextButton: this.tutorialPageId < maxTutorialPageId,
      paging: this._setupPaging(this.campaignTutorial.tutorial.length, this.tutorialPageId)
    };
  },

  actions: {
    submit() {
      this.transitionTo('campaigns.start-or-resume', this.campaignCode, {
        queryParams: {
          hasSeenLanding: true,
          hasSeenTuto: true
        }
      });
    },

    next() {
      const nextTutorialPageId = this.tutorialPageId + 1;
      if (nextTutorialPageId < this.campaignTutorial.tutorial.length) {
        this.set('tutorialPageId', nextTutorialPageId);
        this.refresh();
      }
    }
  }
});
