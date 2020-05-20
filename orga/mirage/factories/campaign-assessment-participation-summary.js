import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  participantExternalId() {
    return 'ABCDEF' + faker.random.number({ min: 100, max: 999 });
  },

  completed: trait({
    afterCreate(campaignAssessmentParticipationSummary) {
      campaignAssessmentParticipationSummary.update({ status: 'completed' });
    }
  }),

  ongoing: trait({
    afterCreate(campaignAssessmentParticipationSummary) {
      campaignAssessmentParticipationSummary.update({ status: 'ongoing' });
    }
  }),

  shared: trait({
    afterCreate(campaignAssessmentParticipationSummary) {
      campaignAssessmentParticipationSummary.update({ status: 'shared' });
      if (!campaignAssessmentParticipationSummary.masteryPercentage) {
        campaignAssessmentParticipationSummary.update({ masterPercentage: 33 });
      }
    }
  }),
});
