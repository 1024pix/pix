import { expect } from 'chai';

import { OrganizationLearnerIdentity } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationLearnerIdentity.ts';

describe('Unit | Domain | Models | OrganizationLearnerIdentity', function () {
  describe('generateUsername', function () {
    it('generates username', function () {
      const organizationLearnerIdentity = new OrganizationLearnerIdentity({
        id: 1,
        firstName: 'prenom',
        lastName: 'nom',
        birthdate: '1980-06-01',
      });

      const username = organizationLearnerIdentity.generateUsername();

      expect(username).to.equal('prenom.nom0106');
    });

    it('generates username without birthdate', function () {
      const organizationLearnerIdentity = new OrganizationLearnerIdentity({
        id: 1,
        firstName: 'prenom',
        lastName: 'nom',
      });

      const username = organizationLearnerIdentity.generateUsername();

      expect(username).to.equal('prenom.nom0000');
    });

    it('normalizes username', function () {
      const organizationLearnerIdentity = new OrganizationLearnerIdentity({
        id: 1,
        firstName: ' pRén  om$!',
        lastName: 'no\u0300m',
        birthdate: '1980-06-01',
      });

      const username = organizationLearnerIdentity.generateUsername();

      expect(username).to.equal('prenom.nom0106');
    });

    it('generates username with generated last part', function () {
      const organizationLearnerIdentity = new OrganizationLearnerIdentity({
        id: 1,
        firstName: 'prenom',
        lastName: 'nom',
        birthdate: '1980-06-01',
      });

      const username = organizationLearnerIdentity.generateUsername(() => '9999');

      expect(username).to.equal('prenom.nom9999');
    });
  });
});
