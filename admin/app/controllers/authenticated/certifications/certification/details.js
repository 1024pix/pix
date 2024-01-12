import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class DetailsController extends Controller {
  @service intl;

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

  get pageTitle() {
    const certifTitle = this.intl.t('pages.certifications.certification.title');
    const detailsTitle = this.intl.t('pages.certifications.certification.details.title');

    return `${certifTitle} ${this.model.id} ${detailsTitle} | Pix Admin`;
  }
}
