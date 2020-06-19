import Service  from '@ember/service';

export default class Errors extends Service {
  errors = [];

  push(error) {
    this.errors.push(error);
  }

  shift() {
    return this.errors.shift();
  }

  hasErrors() {
    return this.errors.length > 0;
  }
}
