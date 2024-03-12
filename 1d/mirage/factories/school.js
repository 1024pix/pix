import { Factory } from 'miragejs';

export default Factory.extend({
  code: 'MINIPIXOU',
  name: 'Ecole des Pourfendeurs',
  organizationLearners() {
    return [
      { id: 1, division: 'CM2-B', firstName: 'Sara', displayName: 'Sara A.', organizationId: 9000 },
      { id: 2, division: 'CM2 A', firstName: 'Mickey', displayName: 'Mickey', organizationId: 9000 },
      { id: 3, division: 'CM2-B', firstName: 'Sara', displayName: 'Sara B.', organizationId: 9000 },
      { id: 4, division: 'CM2 A', firstName: 'Donald', displayName: 'Donald', organizationId: 9000 },
    ];
  },
});
