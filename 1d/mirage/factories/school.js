import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return 'Ecole des Pourfendeurs';
  },
  organizationLearners() {
    return [
      { division: 'CM2-B', firstName: 'Maya', lastName: 'Labeille', organizationId: 9000 },
      { division: 'CM2-A', firstName: 'Mickey', lastName: 'Mouse', organizationId: 9000 },
      { division: 'CM2-B', firstName: 'Sara', lastName: 'Crewe', organizationId: 9000 },
      { division: 'CM2-A', firstName: 'Donald', lastName: 'Duck', organizationId: 9000 },
    ];
  },
  code() {
    return 'MINIPIXOU';
  },
});
