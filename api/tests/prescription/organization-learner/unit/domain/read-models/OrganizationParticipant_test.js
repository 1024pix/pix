import { expect } from '../../../../../test-helper.js';
import { OrganizationParticipant } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationParticipant.js';

describe('Unit | Domain | Read-models | OrganizationParticipant', function () {
  it('should return certificability from learner', function () {
    // given

    // when
    const organizationParticipant = new OrganizationParticipant({
      certifiableAtFromCampaign: new Date('2022-01-01'),
      isCertifiableFromCampaign: false,
      isCertifiableFromLearner: true,
      certifiableAtFromLearner: new Date('2023-01-01'),
    });

    // then
    expect(organizationParticipant.isCertifiable).to.be.true;
    expect(organizationParticipant.certifiableAt).to.be.deep.equal(new Date('2023-01-01'));
  });

  it('should return certificability from campaign', function () {
    // given

    // when
    const organizationParticipant = new OrganizationParticipant({
      certifiableAtFromCampaign: new Date('2023-01-01'),
      isCertifiableFromCampaign: false,
      isCertifiableFromLearner: true,
      certifiableAtFromLearner: new Date('2022-01-01'),
    });

    // then
    expect(organizationParticipant.isCertifiable).to.be.false;
    expect(organizationParticipant.certifiableAt).to.be.deep.equal(new Date('2023-01-01'));
  });

  it('should return certificability from learner when campaign is null', function () {
    // given

    // when
    const organizationParticipant = new OrganizationParticipant({
      certifiableAtFromCampaign: null,
      isCertifiableFromCampaign: null,
      isCertifiableFromLearner: true,
      certifiableAtFromLearner: new Date('2022-01-01'),
    });

    // then
    expect(organizationParticipant.isCertifiable).to.be.true;
    expect(organizationParticipant.certifiableAt).to.be.deep.equal(new Date('2022-01-01'));
  });

  it('should return certificability from campaign when learner is null', function () {
    // given

    // when
    const organizationParticipant = new OrganizationParticipant({
      certifiableAtFromCampaign: new Date('2023-01-01'),
      isCertifiableFromCampaign: true,
      isCertifiableFromLearner: null,
      certifiableAtFromLearner: null,
    });

    // then
    expect(organizationParticipant.isCertifiable).to.be.true;
    expect(organizationParticipant.certifiableAt).to.be.deep.equal(new Date('2023-01-01'));
  });
});
