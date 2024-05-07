import Controller from '@ember/controller';

export default class Missions extends Controller {
  get validatedObjectives() {
    return this.model.validatedObjectives?.split('\n') ?? [];
  }
}
