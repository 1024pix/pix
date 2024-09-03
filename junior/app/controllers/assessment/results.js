import Controller from '@ember/controller';

export default class Missions extends Controller {
  get validatedObjectives() {
    return this.model.mission.validatedObjectives?.split('\n') ?? [];
  }

  get resultMessage() {
    return 'pages.missions.end-page.result.' + this.model.assessment.result;
  }

  get robotMood() {
    switch (this.model.assessment.result) {
      case 'exceeded':
        return 'happy';
      case 'reached':
        return 'proud';
      case 'not-reached':
        return 'retry';
      default:
        return 'default';
    }
  }
}
