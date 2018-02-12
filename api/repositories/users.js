const records = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'jdoe@acme.com' },
  { id: '2', firstName: 'Steve', lastName: 'Smith', email: 'ssmith@acme.com' },
  { id: '3', firstName: 'Franck', lastName: 'Miller', email: 'franck.miller@dream.co' },
  { id: '4', firstName: 'Emily', lastName: 'Bloom', email: 'ebloom@mail.com' },
  { id: '5', firstName: 'Vicky', lastName: 'Rockwood', email: 'vicky.rockwood@dream.co' },
];
let index = 6;

module.exports = {

  find() {
    return records;
  },

  get(id) {
    return records.find((record) => record.id === id);
  },

  create(record) {
    record.id  = (index++).toString();
    records.push(record);
    return record;
  },

  update(record) {
    const entity = get(record.id);
    Object.assign(entity, record);
    return entity;
  },

};
