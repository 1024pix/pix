import Controller from '@ember/controller';

export default class DetailsController extends Controller {
  assignQuestionNumberForDisplay(model) {
    let index = 1;
    return model.certificationChallengesForAdministration.map((challenge) => {
      challenge.questionNumber = index;
      if (!challenge.validatedLiveAlert) {
        index += 1;
        challenge.questionNumber = `${challenge.questionNumber}`;
      } else {
        challenge.questionNumber = `[${challenge.questionNumber}]`;
      }

      return challenge;
    });
  }
}
