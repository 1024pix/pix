import { UserAnonymized } from '../../../../lib/domain/events/UserAnonymized.js';
import { sinon, expect } from '../../../test-helper.js';
import { ObjectValidationError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Events | UserAnonymized', function () {
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
        const userAnonymised = new UserAnonymized({
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
            new UserAnonymized({
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
            new UserAnonymized({
              userId: 1,
              updatedByUserId: 2,
              role: 'METIER',
            }),
        ).to.throw(ObjectValidationError);
      });
    });
  });
});
