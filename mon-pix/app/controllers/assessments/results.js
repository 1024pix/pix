import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

export default Controller.extend({
  urlHome: ENV.APP.HOME_HOST,
  actions: {
    openComparison(assessment_id, answer_id, index) {
      this.transitionToRoute('assessments.comparison', assessment_id, answer_id, index);
    }
  }

});
