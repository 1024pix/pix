import sinon from 'sinon';

import { User } from '../../../../src/identity-access-management/domain/models/User.js';
import { UserWithActivity } from '../../../../src/identity-access-management/domain/read-models/UserWithActivity.js';
import { STATUS } from '../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
import { config } from '../../../../src/shared/config.js';
import { expect } from '../../../test-helper.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Read-Models | UserWithActivity', function () {
  describe('constructor', function () {
    context('when the user has accepted the CGU', function () {
      it('returns the user with accepted TOS status', async function () {
        // given
        const user = domainBuilder.buildUser({
          cgu: false, //irrelevant data to enlighten the fact that values come from tosStatus
          mustValidateTermsOfService: true, //irrelevant data to enlighten the fact that values come from tosStatus
          lastTermsOfServiceValidatedAt: null,
        });

        const acceptedAt = new Date('2025-01-15');
        const tosStatus = { status: STATUS.ACCEPTED, documentPath: '/tos/v2.pdf', acceptedAt: acceptedAt };

        // when
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: 123,
          hasRecommendedTrainings: false,
          shouldSeeDataProtectionPolicyInformationBanner: false,
        });

        // then
        expect(userWithActivity.cgu).to.be.true;
        expect(userWithActivity.mustValidateTermsOfService).to.be.false;
        expect(userWithActivity.lastTermsOfServiceValidatedAt).to.deep.equal(acceptedAt);
        expect(userWithActivity.pixAppTermsOfServiceStatus).to.equal(STATUS.ACCEPTED);
        expect(userWithActivity.pixAppTermsOfServiceDocumentPath).to.deep.equal('/tos/v2.pdf');
      });
    });

    context('when the user must accept the CGU for the first time', function () {
      it('returns the user with requested TOS status', function () {
        // given
        const user = domainBuilder.buildUser();
        const tosStatus = { status: STATUS.REQUESTED, documentPath: '/tos/v1.pdf', acceptedAt: null };

        // when
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
          shouldSeeDataProtectionPolicyInformationBanner: false,
        });

        // then
        expect(userWithActivity.cgu).to.be.false;
        expect(userWithActivity.mustValidateTermsOfService).to.be.true;
        expect(userWithActivity.lastTermsOfServiceValidatedAt).to.be.null;
        expect(userWithActivity.pixAppTermsOfServiceStatus).to.equal(STATUS.REQUESTED);
        expect(userWithActivity.pixAppTermsOfServiceDocumentPath).to.equal('/tos/v1.pdf');
      });
    });

    context('when the user must re-accept the CGU after an update', function () {
      it('returns the user with update-requested TOS status', function () {
        // given
        const user = domainBuilder.buildUser();
        const tosStatus = { status: STATUS.UPDATE_REQUESTED, documentPath: '/tos/v2.pdf', acceptedAt: null };

        // when
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
          shouldSeeDataProtectionPolicyInformationBanner: false,
        });

        // then
        expect(userWithActivity.cgu).to.be.true;
        expect(userWithActivity.mustValidateTermsOfService).to.be.true;
        expect(userWithActivity.lastTermsOfServiceValidatedAt).to.be.null;
        expect(userWithActivity.pixAppTermsOfServiceStatus).to.equal(STATUS.UPDATE_REQUESTED);
        expect(userWithActivity.pixAppTermsOfServiceDocumentPath).to.equal('/tos/v2.pdf');
      });
    });

    context('when the user is not subject to CGU (SCO student)', function () {
      it('returns the user with not-applicable TOS status', function () {
        // given
        const user = domainBuilder.buildUser();
        const tosStatus = { status: STATUS.NOT_APPLICABLE, documentPath: null, acceptedAt: null };

        // when
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
          shouldSeeDataProtectionPolicyInformationBanner: false,
        });

        // then
        expect(userWithActivity.cgu).to.be.false;
        expect(userWithActivity.mustValidateTermsOfService).to.be.false;
        expect(userWithActivity.pixAppTermsOfServiceStatus).to.equal(STATUS.NOT_APPLICABLE);
      });
    });
  });
  describe('#shouldSeeDataProtectionPolicyInformationBanner', function () {
    context('when user has not seen data protection policy but data protection date is not settled', function () {
      it('should return false', function () {
        // given
        const acceptedAt = new Date('2025-01-15');
        const user = new User({ lastDataProtectionPolicySeenAt: null });
        const tosStatus = { status: STATUS.ACCEPTED, documentPath: '/tos/v2.pdf', acceptedAt: acceptedAt };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(null);
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has not seen data protection policy and data protection has been updated', function () {
      it('should return true', function () {
        // given
        const acceptedAt = new Date('2025-01-15');
        const user = new User({ lastDataProtectionPolicySeenAt: null });
        const tosStatus = { status: STATUS.ACCEPTED, documentPath: '/tos/v2.pdf', acceptedAt: acceptedAt };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(new Date()); //data protection has been updated
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.true;
      });

      it('should return false for an organization learner', function () {
        // given
        const user = new User({ lastDataProtectionPolicySeenAt: null });
        const tosStatus = { status: STATUS.NOT_APPLICABLE, documentPath: null, acceptedAt: null };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(new Date());
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection date is not settled', function () {
      it('should return false', function () {
        // given
        const acceptedAt = new Date('2025-01-15');
        const user = new User({ lastDataProtectionPolicySeenAt: new Date() });
        const tosStatus = { status: STATUS.ACCEPTED, documentPath: '/tos/v2.pdf', acceptedAt: acceptedAt };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(null);
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.false;
      });

      it('should return false for an organization learner', function () {
        // given
        const user = new User({ lastDataProtectionPolicySeenAt: new Date() });
        const tosStatus = { status: STATUS.NOT_APPLICABLE, documentPath: null, acceptedAt: null };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(null);
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection has not been updated since', function () {
      it('should return false', function () {
        // given
        const acceptedAt = new Date('2025-01-15');
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(Date.now() + 3600 * 1000) });
        const tosStatus = { status: STATUS.ACCEPTED, documentPath: '/tos/v2.pdf', acceptedAt: acceptedAt };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(new Date());
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.false;
      });

      it('should return false for an organization learner', function () {
        // given
        const user = new User({ lastDataProtectionPolicySeenAt: new Date(Date.now() + 3600 * 1000) });
        const tosStatus = { status: STATUS.NOT_APPLICABLE, documentPath: null, acceptedAt: null };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(new Date());
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has seen data protection policy but data protection has been updated', function () {
      it('should return true', function () {
        // given
        const acceptedAt = new Date('2025-01-15');
        const user = new User({ lastDataProtectionPolicySeenAt: new Date() });
        const tosStatus = { status: STATUS.ACCEPTED, documentPath: '/tos/v2.pdf', acceptedAt: acceptedAt };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(new Date(Date.now() + 3600 * 1000));
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.true;
      });

      it('should return false for an organization learner', function () {
        // given
        const user = new User({ lastDataProtectionPolicySeenAt: new Date() });
        const tosStatus = { status: STATUS.NOT_APPLICABLE, documentPath: null, acceptedAt: null };
        sinon.stub(config.dataProtectionPolicy, 'updateDate').value(new Date(Date.now() + 3600 * 1000));
        const userWithActivity = new UserWithActivity({
          user,
          tosStatus,
          hasAssessmentParticipations: false,
          codeForLastProfileToShare: null,
          hasRecommendedTrainings: false,
        });

        // when
        const result = userWithActivity.shouldSeeDataProtectionPolicyInformationBanner;

        // then
        expect(result).to.be.false;
      });
    });
  });
});
