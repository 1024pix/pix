const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const { statuses } = require('../../../../lib/domain/models/Session');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');

const MISSING_VALUE = '';

describe('Unit | Domain | Validators | session-validator', function () {
  let session;

  beforeEach(function () {
    session = domainBuilder.buildSession({
      address: '51 rue des lillas',
      room: 'Salle John Doe',
      date: '2000-10-20',
      time: '14:30',
      examiner: 'Mister T',
    });
  });

  describe('#validate', function () {
    context('when validation is successful', function () {
      it('should not throw any error', function () {
        expect(sessionValidator.validate(session)).to.not.throw;
      });
    });

    context('when session data validation fails', function () {
      context('on address attribute', function () {
        it('should reject with error when address is missing', function () {
          // given
          const expectedErrors = [
            {
              attribute: 'address',
              message: 'Veuillez indiquer un nom de site.',
            },
          ];
          session.address = MISSING_VALUE;

          try {
            // when
            sessionValidator.validate(session);
            expect.fail('should have thrown an error');
          } catch (entityValidationErrors) {
            // then
            expect(entityValidationErrors).with.deep.property('invalidAttributes', expectedErrors);
          }
        });
      });

      context('on room attribute', function () {
        it('should reject with error when room is missing', async function () {
          // given
          const expectedErrors = [
            {
              attribute: 'room',
              message: 'Veuillez indiquer un nom de salle.',
            },
          ];
          session.room = MISSING_VALUE;

          try {
            // when
            sessionValidator.validate(session);
            expect.fail('should have thrown an error');
          } catch (entityValidationErrors) {
            // then
            expect(entityValidationErrors).with.deep.property('invalidAttributes', expectedErrors);
          }
        });
      });

      context('on date attribute', function () {
        it('should reject with error when date is missing', function () {
          // given
          const expectedErrors = [
            {
              attribute: 'date',
              message: 'Veuillez indiquer une date de début.',
            },
          ];
          session.date = MISSING_VALUE;

          try {
            // when
            sessionValidator.validate(session);
            expect.fail('should have thrown an error');
          } catch (entityValidationErrors) {
            // then
            expect(entityValidationErrors).with.deep.property('invalidAttributes', expectedErrors);
          }
        });
      });

      context('on time attribute', function () {
        it('should reject with error when time is an empty string', function () {
          // given
          const expectedErrors = [
            {
              attribute: 'time',
              message: 'Veuillez indiquer une heure de début.',
            },
          ];
          session.time = '';

          try {
            // when
            sessionValidator.validate(session);
            expect.fail('should have thrown an error');
          } catch (entityValidationErrors) {
            // then
            expect(entityValidationErrors).with.deep.property('invalidAttributes', expectedErrors);
          }
        });

        it('should reject with error when time ihas a format different than HH:MM', function () {
          // given
          const expectedErrors = [
            {
              attribute: 'time',
              message: 'Veuillez indiquer une heure de début.',
            },
          ];
          session.time = '14:23:30';

          try {
            // when
            sessionValidator.validate(session);
            expect.fail('should have thrown an error');
          } catch (entityValidationErrors) {
            // then
            expect(entityValidationErrors).with.deep.property('invalidAttributes', expectedErrors);
          }
        });
      });

      context('on examiner attribute', function () {
        it('should reject with error when examiner is missing', function () {
          // given
          const expectedErrors = [
            {
              attribute: 'examiner',
              message: 'Veuillez indiquer un(e) surveillant(e).',
            },
          ];
          session.examiner = MISSING_VALUE;

          try {
            // when
            sessionValidator.validate(session);
            expect.fail('should have thrown an error');
          } catch (entityValidationErrors) {
            // then
            expect(entityValidationErrors).with.deep.property('invalidAttributes', expectedErrors);
          }
        });
      });
    });
  });

  describe('#validateForMassSessionImport', function () {
    context('when validation is successful', function () {
      it('should not throw any error', function () {
        expect(sessionValidator.validateForMassSessionImport(session, 1)).to.not.throw;
      });
    });

    context('when session data validation fails', function () {
      context('on address attribute', function () {
        it('should reject with error when address is missing', function () {
          // given
          session.address = MISSING_VALUE;

          // when
          const report = sessionValidator.validateForMassSessionImport(session, 1);

          // then
          expect(report).to.deep.equal([
            {
              code: 'SESSION_ADDRESS_REQUIRED',
              line: 1,
            },
          ]);
        });
      });

      context('on room attribute', function () {
        it('should reject with error when room is missing', async function () {
          // given
          session.room = MISSING_VALUE;

          // when
          const report = sessionValidator.validateForMassSessionImport(session, 1);

          // then
          expect(report).to.deep.equal([
            {
              code: 'SESSION_ROOM_REQUIRED',
              line: 1,
            },
          ]);
        });
      });

      context('on date attribute', function () {
        it('should reject with error when date is missing', function () {
          // given
          session.date = MISSING_VALUE;

          // when
          const report = sessionValidator.validateForMassSessionImport(session, 1);

          // then
          expect(report).to.deep.equal([
            {
              code: 'SESSION_DATE_REQUIRED',
              line: 1,
            },
          ]);
        });
      });

      context('on time attribute', function () {
        it('should reject with error when time is an empty string', function () {
          // given
          session.time = '';

          // when
          const report = sessionValidator.validateForMassSessionImport(session, 1);

          // then
          expect(report).to.deep.equal([
            {
              code: 'SESSION_TIME_REQUIRED',
              line: 1,
            },
          ]);
        });

        it('should reject with error when time has a format different than HH:MM', function () {
          // given
          session.time = '14:23:30';

          // when
          const report = sessionValidator.validateForMassSessionImport(session, 1);

          // then
          expect(report).to.deep.equal([
            {
              code: 'SESSION_TIME_REQUIRED',
              line: 1,
            },
          ]);
        });
      });

      context('on examiner attribute', function () {
        it('should reject with error when examiner is missing', function () {
          // given
          session.examiner = MISSING_VALUE;

          // when
          const report = sessionValidator.validateForMassSessionImport(session, 1);

          // then
          expect(report).to.deep.equal([
            {
              code: 'SESSION_EXAMINER_REQUIRED',
              line: 1,
            },
          ]);
        });
      });
    });
  });

  describe('#validateFilters', function () {
    context('return value', function () {
      it('should return the filters in a normalized form', function () {
        const value = sessionValidator.validateAndNormalizeFilters({
          id: '123',
          status: 'finalized',
        });

        expect(typeof value.id).to.equal('number');
        expect(value.status).to.equal('finalized');
      });
    });

    context('when validating id', function () {
      context('when id not in submitted filters', function () {
        it('should not throw any error', function () {
          expect(sessionValidator.validateAndNormalizeFilters({})).to.not.throw;
        });
      });

      context('when id is in submitted filters', function () {
        context('when id is not an integer', function () {
          it('should throw an error', async function () {
            const error = await catchErr(sessionValidator.validateAndNormalizeFilters)({ id: 'salut' });
            expect(error).to.be.instanceOf(EntityValidationError);
          });
        });

        context('when id is an integer', function () {
          it('accept a string containing an int', function () {
            expect(sessionValidator.validateAndNormalizeFilters({ id: '123' })).to.not.throw;
          });

          it('should not throw any error', function () {
            expect(sessionValidator.validateAndNormalizeFilters({ id: 123 })).to.not.throw;
          });
        });
      });
    });

    context('when validating certificationCenterName', function () {
      context('when certificationCenterName not in submitted filters', function () {
        it('should not throw any error', function () {
          expect(sessionValidator.validateAndNormalizeFilters({})).to.not.throw;
        });
      });

      context('when certificationCenterName is in submitted filters', function () {
        context('when certificationCenterName is not an string', function () {
          it('should throw an error', async function () {
            const error = await catchErr(sessionValidator.validateAndNormalizeFilters)({
              certificationCenterName: 123,
            });
            expect(error).to.be.instanceOf(EntityValidationError);
          });
        });

        context('when certificationCenterName is a string', function () {
          it('should not throw an error', async function () {
            const certificationCenterName = '   Coucou le dév qui lit ce message !   ';
            expect(sessionValidator.validateAndNormalizeFilters({ certificationCenterName })).to.not.throw;
            expect(
              sessionValidator.validateAndNormalizeFilters({ certificationCenterName }).certificationCenterName
            ).to.equal(certificationCenterName.trim());
          });
        });
      });
    });

    context('when validating status', function () {
      context('when status not in submitted filters', function () {
        it('should not throw any error', function () {
          expect(sessionValidator.validateAndNormalizeFilters({})).to.not.throw;
        });
      });

      context('when status is in submitted filters', function () {
        context('when status is not an string', function () {
          it('should throw an error', async function () {
            const error = await catchErr(sessionValidator.validateAndNormalizeFilters)({ status: 123 });
            expect(error).to.be.instanceOf(EntityValidationError);
          });
        });

        context('when status is not in the statuses list', function () {
          it('should throw an error', async function () {
            const error = await catchErr(sessionValidator.validateAndNormalizeFilters)({ status: 'SomeOtherStatus' });
            expect(error).to.be.instanceOf(EntityValidationError);
          });
        });

        context('when status is in the statuses list', function () {
          it('should not throw an error', async function () {
            expect(sessionValidator.validateAndNormalizeFilters({ status: statuses.CREATED })).to.not.throw;
            expect(sessionValidator.validateAndNormalizeFilters({ status: statuses.FINALIZED })).to.not.throw;
            expect(sessionValidator.validateAndNormalizeFilters({ status: statuses.IN_PROCESS })).to.not.throw;
            expect(sessionValidator.validateAndNormalizeFilters({ status: statuses.PROCESSED })).to.not.throw;
          });
        });
      });
    });

    context('when validating resultsSentToPrescriberAt', function () {
      context('when resultsSentToPrescriberAt not in submitted filters', function () {
        it('should not throw any error', function () {
          expect(sessionValidator.validateAndNormalizeFilters({})).to.not.throw;
        });
      });

      context('when resultsSentToPrescriberAt is in submitted filters', function () {
        context('when resultsSentToPrescriberAt is not a boolean', function () {
          it('should throw an error', async function () {
            const error = await catchErr(sessionValidator.validateAndNormalizeFilters)({
              resultsSentToPrescriberAt: 123,
            });
            expect(error).to.be.instanceOf(EntityValidationError);
          });
        });

        context('when resultsSentToPrescriberAt is not in the resultsSentToPrescriberAt list', function () {
          it('should throw an error', async function () {
            const error = await catchErr(sessionValidator.validateAndNormalizeFilters)({
              resultsSentToPrescriberAt: 'SomeOtherValue',
            });
            expect(error).to.be.instanceOf(EntityValidationError);
          });
        });

        context('when resultsSentToPrescriberAt is a boolean', function () {
          it('should not throw an error', async function () {
            expect(sessionValidator.validateAndNormalizeFilters({ resultsSentToPrescriberAt: true })).to.not.throw;
            expect(sessionValidator.validateAndNormalizeFilters({ resultsSentToPrescriberAt: false })).to.not.throw;
          });
        });
      });
    });
  });
});
