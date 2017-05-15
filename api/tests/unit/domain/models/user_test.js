const { describe, it, expect, beforeEach, sinon } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/data/user');
const faker = require('faker');

describe('Unit | Domain | Models | User', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: 'F26251JHS',
        cgu: 'true'
      };
    });

    it('should have an email', () => {
      // Given
      rawData.email = '';
      const user = new User(rawData);

      // When
      const promise = user.save();

      // Then
      return promise.catch((err) => {
        const emailErrors = err.data[ 'email' ];
        expect(emailErrors).to.exist;

        expect(emailErrors).to.deep.equal([ 'Votre adresse electronique n\'est pas correcte.' ]);
      });
    });

    it('should have a first name', () => {
      // Given
      rawData.firstName = '';
      const user = new User(rawData);

      // When
      const promise = user.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail('should not succeed');
        })
        .catch((err) => {
          const firstName = err.data[ 'firstName' ];
          expect(firstName).to.exist;
          expect(firstName).to.deep.equal([ 'Votre prénom n\'est pas renseigné.' ]);
        });
    });

    it('should have a lastname', () => {
      // Given
      rawData.lastName = '';
      const user = new User(rawData);

      // When
      const promise = user.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail('should not succeed');
        })
        .catch((err) => {
          const lastName = err.data[ 'lastName' ];
          expect(lastName).to.exist;
          expect(lastName).to.deep.equal([ 'Votre nom n\'est pas renseigné.' ]);
        });
    });

    describe('the password field', () => {
      it('should have a minimum length', () => {
        // Given
        rawData.password = 'F26251J';
        const user = new User(rawData);

        // When
        const promise = user.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('should not succeed');
          })
          .catch((err) => {
            const passwordErrors = err.data[ 'password' ];
            expect(passwordErrors).to.exist;
            expect(passwordErrors).to.deep.equal([ 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.' ]);
          });
      });

      it('should contains at least a letter', () => {
        // Given
        rawData.password = '000000000';
        const user = new User(rawData);

        // When
        const promise = user.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('should not succeed');
          })
          .catch((err) => {
            const passwordErrors = err.data[ 'password' ];
            expect(passwordErrors).to.exist;
            expect(passwordErrors).to.deep.equal([ 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.' ]);
          });
      });

      it('should contains at least a figure', () => {
        // Given
        rawData.password = 'FFFFFFFF';
        const user = new User(rawData);

        // When
        const promise = user.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('should not succeed');
          })
          .catch((err) => {
            const passwordErrors = err.data[ 'password' ];
            expect(passwordErrors).to.exist;
            expect(passwordErrors).to.deep.equal([ 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.' ]);
          });
      });

      it('should be invalid when cgu are not true', () => {
        // Given
        rawData.cgu = 'false';
        const user = new User(rawData);

        // When
        const promise = user.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('should not succeed');
          })
          .catch((err) => {
            const cguErrors = err.data[ 'cgu' ];
            expect(cguErrors).to.exist;
            expect(cguErrors).to
              .deep.equal([ 'Veuillez accepter les conditions générales d\'utilisation (CGU) avant de créer un compte.' ]);
          });
      });

      it('should be invalid when cgu are empty', () => {
        // Given
        rawData.cgu = undefined;
        const user = new User(rawData);

        // When
        const promise = user.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('should not succeed');
          })
          .catch((err) => {
            const cguErrors = err.data[ 'cgu' ];
            expect(cguErrors).to.exist;
            expect(cguErrors).to
              .deep.equal([ 'Le champ CGU doit être renseigné.' ]);
          });
      });

      it('is valid when everything works', () => {
        // Given
        const user = new User(rawData);

        // When
        const promise = user.save();

        // Then
        return promise
          .catch(() => {
            sinon.assert.fail('should not succeed');
          });
      });

    });

  });

});
