import Controller from '@ember/controller';

export default class Division extends Controller {
  uppercaseFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
