import ApplicationSerializer from './application';

export default class Certification extends ApplicationSerializer {
  serialize(snapshot, options) {
    if (options && options.onlyInformation) {
      const data = {};
      this.serializeAttribute(snapshot, data, 'firstName', 'first-name');
      this.serializeAttribute(snapshot, data, 'lastName', 'last-name');
      this.serializeAttribute(snapshot, data, 'birthplace', 'birthplace');
      this.serializeAttribute(snapshot, data, 'birthdate', 'birthdate');
      this.serializeAttribute(snapshot, data, 'isPublished', 'is-published');
      this.serializeAttribute(snapshot, data, 'sex', 'sex');
      this.serializeAttribute(snapshot, data, 'birthCountry', 'birth-country');
      this.serializeAttribute(snapshot, data, 'birthPostalCode', 'birth-postal-code');
      this.serializeAttribute(snapshot, data, 'birthInseeCode', 'birth-insee-code');
      data.type = 'certifications';
      if (options.includeId) {
        data.id = parseInt(snapshot.id);
      }
      return { data: data };
    } else {
      return super.serialize(...arguments);
    }
  }
}
