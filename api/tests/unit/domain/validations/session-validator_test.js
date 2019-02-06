const { expect, domainBuilder } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');

const MISSING_VALUE = '';

describe('Unit | Domain | Validators | session-validator', () => {

  let session;

  beforeEach(() => {
    session = domainBuilder.buildSession({
      address: '51 rue des lillas',
      room: 'Salle John Doe',
      date: '2000-10-20',
      time: '14:30',
      examiner: 'Mister T',
    });
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should resolve (with no value) when validation is successful', () => {
        // when/then
        return expect(() => sessionValidator.validate(session)).to.not.throw;
      });

    });

    context('when session data validation fails', () => {

      context('on address attribute', () => {

        it('should reject with error when address is missing', () => {
          // given
          const expectedErrors = [{
            attribute: 'address',
            message: 'Veuillez donner un nom de site.'
          }];
          session.address = MISSING_VALUE;

          // when/then
          return expect(() => sessionValidator.validate(session))
            .to.throw(EntityValidationError)
            .with.deep.property('invalidAttributes', expectedErrors);
        });

      });

      context('on room attribute', () => {

        it('should reject with error when room is missing', () => {
          // given
          const expectedErrors = [{
            attribute: 'room',
            message: 'Veuillez donner un nom de salle.'
          }];
          session.room = MISSING_VALUE;

          // when/then
          return expect(() => sessionValidator.validate(session))
            .to.throw(EntityValidationError)
            .with.deep.property('invalidAttributes', expectedErrors);
        });

      });

      context('on date attribute', () => {

        it('should reject with error when date is missing', () => {
          // given
          const expectedErrors = [{
            attribute: 'date',
            message: 'Veuillez entrer une date au format (jj/mm/yyyy).'
          }];
          session.date = MISSING_VALUE;

          // when/then
          return expect(() => sessionValidator.validate(session))
            .to.throw(EntityValidationError)
            .with.deep.property('invalidAttributes', expectedErrors);
        });

      });

      context('on time attribute', () => {

        it('should reject with error when time is an empty string', () => {
          // given
          const expectedErrors = [{
            attribute: 'time',
            message: 'Veuillez entrer une heure au format (HH:MM).'
          }];
          session.time = '';

          // when/then
          return expect(() => sessionValidator.validate(session))
            .to.throw(EntityValidationError)
            .with.deep.property('invalidAttributes', expectedErrors);
        });

        it('should reject with error when time ihas a format different than HH:MM', () => {
          // given
          const expectedErrors = [{
            attribute: 'time',
            message: 'Veuillez entrer une heure au format (HH:MM).'
          }];
          session.time = '14:23:30';

          // when/then
          return expect(() => sessionValidator.validate(session))
            .to.throw(EntityValidationError)
            .with.deep.property('invalidAttributes', expectedErrors);
        });

      });

      context('on examiner attribute', () => {

        it('should reject with error when examiner is missing', () => {
          // given
          const expectedErrors = [{
            attribute: 'examiner',
            message: 'Veuillez indiquer un(e) surveillant(e).'
          }];
          session.examiner = MISSING_VALUE;

          // when/then
          return expect(() => sessionValidator.validate(session))
            .to.throw(EntityValidationError)
            .with.deep.property('invalidAttributes', expectedErrors);
        });

      });

    });
  });
});
