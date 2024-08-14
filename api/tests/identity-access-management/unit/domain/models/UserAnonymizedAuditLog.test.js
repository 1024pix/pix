import { UserAnonymizedEventLoggingJob } from '../../../../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { ObjectValidationError } from '../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | UserAnonymizedEventLoggingJob', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2023-08-17');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#constructor', function () {
    context('when instantiated with valid parameters', function () {
      it('instantiates a new event', function () {
        // when
        const userAnonymised = new UserAnonymizedEventLoggingJob({
          userId: 1,
          updatedByUserId: 2,
          role: 'SUPER_ADMIN',
        });

        // then
        const expectedUserAnonymised = {
          userId: 1,
          updatedByUserId: 2,
          client: 'PIX_ADMIN',
          occurredAt: new Date(),
          role: 'SUPER_ADMIN',
        };
        expect(userAnonymised).to.deep.equal(expectedUserAnonymised);
      });
    });

    context('when client is not "PIX_ADMIN"', function () {
      it('throws an ObjectValidation error', function () {
        expect(
          () =>
            new UserAnonymizedEventLoggingJob({
              userId: 1,
              updatedByUserId: 2,
              client: 'NOOB',
              role: 'SUPER_ADMIN',
            }),
        ).to.throw(ObjectValidationError);
      });
    });

    context('when role is not "SUPER_ADMIN" nor "SUPPORT"', function () {
      it('throws an ObjectValidation error', function () {
        // then
        expect(
          () =>
            new UserAnonymizedEventLoggingJob({
              userId: 1,
              updatedByUserId: 2,
              role: 'METIER',
            }),
        ).to.throw(ObjectValidationError);
      });
    });
  });
});
