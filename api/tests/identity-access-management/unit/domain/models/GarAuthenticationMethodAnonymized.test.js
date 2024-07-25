import { GarAuthenticationMethodAnonymized } from '../../../../../src/identity-access-management/domain/models/GarAuthenticationMethodAnonymized.js';
import { ObjectValidationError } from '../../../../../src/shared/domain/errors.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Models | GarAuthenticationMethodAnonymized', function () {
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
      it('instantiates a new payload', function () {
        // when
        const payload = new GarAuthenticationMethodAnonymized({
          userIds: [1001, 1002, 1003],
          updatedByUserId: 1,
        });

        // then
        const expectedEvent = {
          userIds: [1001, 1002, 1003],
          updatedByUserId: 1,
          client: 'PIX_ADMIN',
          occurredAt: new Date(),
          role: 'SUPER_ADMIN',
        };
        expect(payload).to.deep.equal(expectedEvent);
      });
    });

    context('when userIds is not given', function () {
      it('throws an ObjectValidation error', function () {
        expect(
          () =>
            new GarAuthenticationMethodAnonymized({
              updatedByUserId: 1,
            }),
        ).to.throw(ObjectValidationError);
      });
    });

    context('when client is not "PIX_ADMIN"', function () {
      it('throws an ObjectValidation error', function () {
        expect(
          () =>
            new GarAuthenticationMethodAnonymized({
              userIds: [1001, 1002, 1003],
              updatedByUserId: 1,
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
            new GarAuthenticationMethodAnonymized({
              userIds: [1001, 1002, 1003],
              updatedByUserId: 1,
              role: 'METIER',
            }),
        ).to.throw(ObjectValidationError);
      });
    });
  });
});
