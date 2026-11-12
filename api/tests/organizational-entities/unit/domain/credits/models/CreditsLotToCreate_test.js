import { expect } from 'chai';

import { CreditsLotToCreate } from '../../../../../../src/organizational-entities/domain/credits/models/CreditsLotToCreate.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

const millisecondBefore = (isoDate) => new Date(new Date(isoDate).getTime() - 1);

describe('Unit | Organizational Entities | Domain | Model | CreditsLotToCreate', function () {
  describe('constructor', function () {
    it('should create a CreditsLotToCreate with valid attributes', function () {
      // when
      const validAttributes = {
        structureId: 1,
        count: 100,
        activationDate: '2023-01-01',
        expirationDate: '2023-12-31',
        reference: ' REF123 ',
        createdBy: 42,
      };

      const expectedAttributes = {
        structureId: 1,
        count: 100,
        activationDate: new Date('2022-12-31T23:00:00Z'),
        expirationDate: millisecondBefore('2023-12-31T23:00:00Z'),
        reference: 'REF123',
        createdBy: 42,
      };

      const creditsLot = new CreditsLotToCreate(validAttributes);

      // then
      expect(creditsLot).to.deep.equal(expectedAttributes);
    });

    context('dates', function () {
      it('starts the lot at the first instant of the activation day in Paris time', function () {
        // when
        const creditsLot = new CreditsLotToCreate({
          structureId: 1,
          count: 100,
          activationDate: '2026-07-01',
          expirationDate: '2027-06-30',
          reference: 'REF123',
          createdBy: 42,
        });

        // then
        expect(creditsLot.activationDate).to.deep.equal(new Date('2026-06-30T22:00:00Z'));
      });

      it('ends the lot at the last instant of the expiration day in Paris time, in winter', function () {
        // when
        const creditsLot = new CreditsLotToCreate({
          structureId: 1,
          count: 100,
          activationDate: '2026-01-01',
          expirationDate: '2026-12-31',
          reference: 'REF123',
          createdBy: 42,
        });

        // then
        expect(creditsLot.expirationDate).to.deep.equal(millisecondBefore('2026-12-31T23:00:00Z'));
      });

      it('ends the lot at the last instant of the expiration day in Paris time, in summer', function () {
        // when
        const creditsLot = new CreditsLotToCreate({
          structureId: 1,
          count: 100,
          activationDate: '2026-01-01',
          expirationDate: '2026-06-30',
          reference: 'REF123',
          createdBy: 42,
        });

        // then
        expect(creditsLot.expirationDate).to.deep.equal(millisecondBefore('2026-06-30T22:00:00Z'));
      });

      it('ends the lot at the last instant of the day when the clocks change', function () {
        // when
        const creditsLot = new CreditsLotToCreate({
          structureId: 1,
          count: 100,
          activationDate: '2026-01-01',
          expirationDate: '2026-10-25',
          reference: 'REF123',
          createdBy: 42,
        });

        // then
        expect(creditsLot.expirationDate).to.deep.equal(millisecondBefore('2026-10-25T23:00:00Z'));
      });
    });

    context('error cases', function () {
      context('Count', function () {
        it('should throw an error if count is not a positive integer', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: -10,
            activationDate: '2023-01-01',
            expirationDate: '2023-12-31',
            reference: 'REF123',
            createdBy: 42,
          };

          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include(
            'Le nombre de crédits doit être un nombre entier supérieur à 0.',
          );
        });

        it('it should throw an error if count is undefined', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: undefined,
            activationDate: '2023-01-01',
            expirationDate: '2023-12-31',
            reference: 'REF123',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include('Le nombre de crédits est obligatoire.');
        });

        it('it should throw an error if count is zero', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 0,
            activationDate: '2023-01-01',
            expirationDate: '2023-12-31',
            reference: 'REF123',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include(
            'Le nombre de crédits doit être un nombre entier supérieur à 0.',
          );
        });
      });

      context('Dates', function () {
        it('should throw an error if activationDate is before 2015-01-01', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 100,
            activationDate: '2014-12-31',
            expirationDate: '2023-12-31',
            reference: 'REF123',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include("La date d'activation est trop ancienne.");
        });

        it('should throw an error if expirationDate is before activationDate', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 100,
            activationDate: '2023-01-01',
            expirationDate: '2022-12-31',
            reference: 'REF123',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include(
            "La date d'expiration doit être postérieure à la date d'activation.",
          );
        });

        it('should throw an error if date is not in YYYY-MM-DD format', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 100,
            activationDate: '01/01/2023',
            expirationDate: '31/12/2023',
            reference: 'REF123',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include("Le format de la date n'est pas correct.");
        });

        it('should only report the activationDate when it is missing', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 100,
            activationDate: undefined,
            expirationDate: '2023-12-31',
            reference: 'REF123',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal([
            {
              attribute: 'activationDate',
              message: "Les dates d'activation et d'expiration sont obligatoires.",
            },
          ]);
        });

        it('should only report the activationDate when its format is invalid', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 100,
            activationDate: 'not-a-date',
            expirationDate: '2023-12-31',
            reference: 'REF123',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal([
            {
              attribute: 'activationDate',
              message: "Le format de la date n'est pas correct.",
            },
          ]);
        });
      });

      context('Reference', function () {
        it('should throw an error if reference is empty', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 100,
            activationDate: '2023-01-01',
            expirationDate: '2023-12-31',
            reference: '',
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include('La référence est obligatoire.');
        });

        it('should throw an error if reference is undefined', function () {
          // given
          const invalidAttributes = {
            structureId: 1,
            count: 100,
            activationDate: '2023-01-01',
            expirationDate: '2023-12-31',
            reference: undefined,
            createdBy: 42,
          };
          // when
          const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].message).to.include('La référence est obligatoire.');
        });
      });

      it('should throw an error with multiple invalid attributes', function () {
        //given
        const invalidAttributes = {
          structureId: 1,
          count: -10,
          activationDate: '2023-01-01',
          expirationDate: '2023-12-31',
          reference: undefined,
          createdBy: 42,
        };
        // when
        const error = catchErrSync(() => new CreditsLotToCreate(invalidAttributes))();

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.have.lengthOf(2);
        expect(error.invalidAttributes[1].message).to.include('La référence est obligatoire.');
        expect(error.invalidAttributes[0].message).to.include(
          'Le nombre de crédits doit être un nombre entier supérieur à 0.',
        );
      });
    });
  });
});
