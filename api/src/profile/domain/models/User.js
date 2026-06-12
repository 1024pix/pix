export class User {
  id;
  #firstName;
  #lastName;

  constructor({ id, firstName, lastName }) {
    this.id = id;
    this.#firstName = firstName;
    this.#lastName = lastName;
  }

  get firstName() {
    return this.#firstName.toUpperCase().trim();
  }

  get lastName() {
    return this.#lastName.toUpperCase().trim();
  }

  toForm(createdAt, locale, transformStringForFileName) {
    const map = new Map();

    const filename =
      transformStringForFileName(this.lastName) + '_' + transformStringForFileName(this.firstName) + '_' + Date.now();

    map.set('firstName', this.firstName);
    map.set('lastName', this.lastName);
    map.set('filename', filename);
    map.set('date', createdAt.toLocaleDateString(locale));

    return map;
  }
}
