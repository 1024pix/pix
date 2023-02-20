import { expect, sinon } from '../../../test-helper';
import UserToCreate from '../../../../lib/domain/models/UserToCreate';

describe('Unit | Domain | Models | UserToCreate', function () {
  describe('constructor', function () {
    it('should build a default user', function () {
      // given / when
      const user = new UserToCreate();

      // then
      expect(user).to.deep.equal({
        firstName: '',
        lastName: '',
        email: null,
        cgu: false,
        hasSeenAssessmentInstructions: false,
        username: null,
        mustValidateTermsOfService: false,
        lastTermsOfServiceValidatedAt: null,
        lang: 'fr',
        hasSeenNewDashboardInfo: false,
        isAnonymous: false,
        hasSeenFocusedChallengeTooltip: false,
        hasSeenOtherChallengesTooltip: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });

  describe('#create', function () {
    it('should create a user', function () {
      // given
      const now = new Date('2022-04-01');
      const clock = sinon.useFakeTimers({ now });

      // when
      const user = UserToCreate.create({ email: '  anneMAIL@example.net ' });

      // then
      expect(user.email).to.equal('annemail@example.net');
      expect(user.updatedAt).to.deep.equal(now);
      expect(user.createdAt).to.deep.equal(now);
      clock.restore();
    });
  });

  describe('#createWithTermsOfServiceAccepted', function () {
    it('should create a user from pole emploi', function () {
      // given
      const now = new Date('2022-04-01');
      const clock = sinon.useFakeTimers({ now });

      // when
      const user = UserToCreate.createWithTermsOfServiceAccepted({ email: '  anneMAIL@example.net ' });

      // then
      expect(user.cgu).to.equal(true);
      expect(user.lastTermsOfServiceValidatedAt).to.deep.equal(now);
      expect(user.updatedAt).to.deep.equal(now);
      expect(user.createdAt).to.deep.equal(now);
      clock.restore();
    });
  });

  describe('#createAnonymous', function () {
    it('should create an anonymous user', function () {
      // given
      const now = new Date('2022-04-01');
      const clock = sinon.useFakeTimers({ now });

      // when
      const user = UserToCreate.createAnonymous({ email: '  anneMAIL@example.net ' });

      // then
      expect(user.isAnonymous).to.equal(true);
      expect(user.updatedAt).to.deep.equal(now);
      expect(user.createdAt).to.deep.equal(now);
      clock.restore();
    });
  });
});
