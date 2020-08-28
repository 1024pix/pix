const HigherEducationRegistration = require('../../../../lib/domain/models/HigherEducationRegistration');
const { expect, catchErr } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | HigherEducationRegistration', () => {

  describe('#validate', () => {

    const buildRegistration = (attributes) => new HigherEducationRegistration(attributes);

    const validAttributes = {
      studentNumber: 'A12345',
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2020-01-01',
      organizationId: 123,
    };

    context('when firstName is not present', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, firstName: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when all required fields are presents', () => {
      it('is valid', async () => {
        try {
          new HigherEducationRegistration(validAttributes);
        } catch (e) {
          expect.fail('higherEducationRegistration is valid when all required fields are present');
        }
      });
    });

    context('when isSupernumerary is true', () => {
      context('when student number is not present', () => {
        it('is valid', async () => {
          try {
            await buildRegistration({ ...validAttributes, studentNumber: null, isSupernumerary: true });
          } catch (e) {
            expect.fail('higherEducationRegistration is valid when all required fields are present');
          }
        });

        context('when student number is present', () => {
          it('is valid', async () => {
            try {
              await buildRegistration({ ...validAttributes, studentNumber: '1234', isSupernumerary: true });
            } catch (e) {
              expect.fail('higherEducationRegistration is valid when all required fields are present');
            }
          });
        });
      });

      context('when isSupernumerary is false', () => {
        context('when student number is not present', () => {
          it('throws an error', async () => {
            const error = await catchErr(buildRegistration)({ ...validAttributes, studentNumber: null, isSupernumerary: false });

            expect(error).to.be.instanceOf(EntityValidationError);
          });
        });

        context('when student number is present', () => {
          it('is valid', async () => {
            try {
              await buildRegistration({ ...validAttributes, studentNumber: '1234', isSupernumerary: false });
            } catch (e) {
              expect.fail('higherEducationRegistration is valid when all required fields are present');
            }
          });
        });
      });
    });

    context('when lastName is not present', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, lastName: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate is not present', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate is not a date', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: 'sdfsdfsdf' });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate has not a valid format', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: '2020/02/01' });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when email is not correctly formed', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, email: 'sdfsfsdf' });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when there are several errors', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, firstName: null, lastName: null });

        const errorList = error.invalidAttributes.map(({ attribute }) => attribute);
        expect(errorList).to.exactlyContain(['lastName', 'firstName']);
      });
    });

    context('when organizationId is not valid', () => {
      it('throws an error when organizationId is not defined', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, organizationId: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
      it('throws an error when organizationId is not a number', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, organizationId: 'salut' });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });
  });
});
