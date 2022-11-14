import Controller from '@ember/controller';

export default class AlreadyProfileSharedController extends Controller {
  get query() {
    return {
      retry: true,
    };
  }
}
