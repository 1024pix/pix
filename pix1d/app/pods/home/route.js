import Route from '@ember/routing/route';

export default class HomeRoute extends Route {
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.id = null;
    }
  }
}
