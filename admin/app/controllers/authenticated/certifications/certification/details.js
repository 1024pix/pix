import Controller from '@ember/controller';

export default class DetailsController extends Controller {
  assignQuestionNumberForDisplay(model) {
    let i = 1;
    return model.certificationChallengesForAdministration.map((challenge) => {
      challenge.questionNumber = i;
      if (!challenge.validatedLiveAlert) {
        i += 1;
        challenge.questionNumber = `${challenge.questionNumber}`;
      } else {
        challenge.questionNumber = `[${challenge.questionNumber}]`;
      }

      return challenge;
    });
  }
}
