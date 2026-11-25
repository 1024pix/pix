import { expect } from 'chai';

import { OrganizationLearnerIdentity } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationLearnerIdentity.ts';

describe('Unit | Domain | Models | OrganizationLearnerIdentity', function () {
  describe('generateUsername', function () {
    it('should generate username', function () {
      const organizationLearnerIdentity = new OrganizationLearnerIdentity({
        firstName: 'prenom',
        lastName: 'nom',
        birthdate: '1980-06-01',
      });

      const username = organizationLearnerIdentity.generateUsername();

      expect(username).to.equal('prenom.nom0106');
    });

    it('should normalize username', function () {
      const organizationLearnerIdentity = new OrganizationLearnerIdentity({
        firstName: ' pRén  om$!',
        lastName: 'no\u0300m',
        birthdate: '1980-06-01',
      });

      const username = organizationLearnerIdentity.generateUsername();

      expect(username).to.equal('prenom.nom0106');
    });

    it('should generate username with generated last part', function () {
      const organizationLearnerIdentity = new OrganizationLearnerIdentity({
        firstName: 'prenom',
        lastName: 'nom',
        birthdate: '1980-06-01',
      });

      const username = organizationLearnerIdentity.generateUsername(() => 'toto');

      expect(username).to.equal('prenom.nomtoto');
    });
  });
});
