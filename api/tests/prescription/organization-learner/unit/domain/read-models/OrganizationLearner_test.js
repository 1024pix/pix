import { expect } from '../../../../../test-helper.js';
import { OrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearner.js';

describe('Unit | Domain | Read-models | OrganizationLearner', function () {
  it('should return certificability from learner', function () {
    // given

    // when
    const organizationLearner = new OrganizationLearner({
      certifiableAtFromCampaign: new Date('2022-01-01'),
      isCertifiableFromCampaign: false,
      isCertifiableFromLearner: true,
      certifiableAtFromLearner: new Date('2023-01-01'),
    });

    // then
    expect(organizationLearner.isCertifiable).to.be.true;
    expect(organizationLearner.certifiableAt).to.be.deep.equal(new Date('2023-01-01'));
  });

  it('should return certificability from campaign', function () {
    // given

    // when
    const organizationLearner = new OrganizationLearner({
      certifiableAtFromCampaign: new Date('2023-01-01'),
      isCertifiableFromCampaign: false,
      isCertifiableFromLearner: true,
      certifiableAtFromLearner: new Date('2022-01-01'),
    });

    // then
    expect(organizationLearner.isCertifiable).to.be.false;
    expect(organizationLearner.certifiableAt).to.be.deep.equal(new Date('2023-01-01'));
  });

  it('should return certificability from learner when campaign is null', function () {
    // given

    // when
    const organizationLearner = new OrganizationLearner({
      certifiableAtFromCampaign: null,
      isCertifiableFromCampaign: null,
      isCertifiableFromLearner: true,
      certifiableAtFromLearner: new Date('2022-01-01'),
    });

    // then
    expect(organizationLearner.isCertifiable).to.be.true;
    expect(organizationLearner.certifiableAt).to.be.deep.equal(new Date('2022-01-01'));
  });

  it('should return certificability from campaign when learner is null', function () {
    // given

    // when
    const organizationLearner = new OrganizationLearner({
      certifiableAtFromCampaign: new Date('2023-01-01'),
      isCertifiableFromCampaign: true,
      isCertifiableFromLearner: null,
      certifiableAtFromLearner: null,
    });

    // then
    expect(organizationLearner.isCertifiable).to.be.true;
    expect(organizationLearner.certifiableAt).to.be.deep.equal(new Date('2023-01-01'));
  });
});
