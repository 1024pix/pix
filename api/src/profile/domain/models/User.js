import capitalize from 'lodash/capitalize.js';

export class User {
  id;
  #firstName;
  #lastName;

  constructor({ id, firstName, lastName }) {
    this.id = id;
    this.#firstName = firstName;
    this.#lastName = lastName;
  }

  get fullName() {
    return capitalize(this.#firstName) + ' ' + this.#lastName.toUpperCase();
  }

  toForm(createdAt) {
    const map = new Map();

    map.set('fullName', this.fullName);
    map.set('filename', this.fullName + Date.now());
    map.set('date', createdAt);

    return map;
  }
}
