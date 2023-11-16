import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModuleDetails extends Component {
  @service store;

  @tracked correctionResponse = {};

  @action
  async submitAnswer(answerData) {
    const elementAnswer = await this.store
      .createRecord('element-answer', {
        userResponse: answerData.userResponse,
      })
      .save({
        adapterOptions: { elementId: answerData.elementId, moduleSlug: this.args.module.id },
      });

    // Change ref to refresh the component
    this.correctionResponse = {
      ...this.correctionResponse,
    };
    this.correctionResponse[answerData.elementId] = await elementAnswer.correction;
  }

  @action
  continueToNextGrain() {
    // eslint-disable-next-line no-console
    console.info('Continue to next grain');
  }
}
