import { Factory } from 'miragejs';

export default Factory.extend({
  code: 'MINIPIXOU',
  name: 'Ecole des Pourfendeurs',
  organizationLearners() {
    return [
      { id: 1, division: 'CM2-B', firstName: 'Maya', lastName: 'Labeille', organizationId: 9000 },
      { id: 2, division: 'CM2 A', firstName: 'Mickey', lastName: 'Mouse', organizationId: 9000 },
      { id: 3, division: 'CM2-B', firstName: 'Sara', lastName: 'Crewe', organizationId: 9000 },
      { id: 4, division: 'CM2 A', firstName: 'Donald', lastName: 'Duck', organizationId: 9000 },
    ];
  },
});
