const { expect, sinon } = require('../../../test-helper');
const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const faker = require('faker');

describe('Unit | Domain | Models | BookshelfUser', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: 'F26251JHS',
        cgu: true
      };
    });

    it('should fail when the email is empty', () => {
      // Given
      rawData.email = '';
      const user = new BookshelfUser(rawData);

      // When
      const promise = user.save();

      // Then
      return promise.catch((err) => {
        const emailErrors = err.data['email'];
        expect(emailErrors).to.exist;

        expect(emailErrors).to.deep.equal(['Votre adresse electronique n\'est pas correcte.']);
      });
    });

    it('should have a first name', () => {
      // Given
      rawData.firstName = '';
      const user = new BookshelfUser(rawData);

      // When
      const promise = user.save();

      // Then
      return promise.then(() => {
        sinon.assert.fail('should not succeed');
      }).catch((err) => {
        const firstName = err.data['firstName'];
        expect(firstName).to.exist;
        expect(firstName).to.deep.equal(['Votre prénom n\'est pas renseigné.']);
      });
    });

    it('should have a lastname', () => {
      // Given
      rawData.lastName = '';
      const user = new BookshelfUser(rawData);

      // When
      const promise = user.save();

      // Then
      return promise.then(() => {
        sinon.assert.fail('should not succeed');
      }).catch((err) => {
        const lastName = err.data['lastName'];
        expect(lastName).to.exist;
        expect(lastName).to.deep.equal(['Votre nom n\'est pas renseigné.']);
      });
    });

    describe('the password field', () => {
      it('should have a minimum length', () => {
        // Given
        rawData.password = 'F26251J';
        const user = new BookshelfUser(rawData);

        // When
        const promise = user.save();

        // Then
        return promise.then(() => {
          sinon.assert.fail('should not succeed');
        }).catch((err) => {
          const passwordErrors = err.data['password'];
          expect(passwordErrors).to.exist;
          expect(passwordErrors).to.deep.equal(['Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.']);
        });
      });

      it('should contains at least a letter', () => {
        // Given
        rawData.password = '000000000';
        const user = new BookshelfUser(rawData);

        // When
        const promise = user.save();

        // Then
        return promise.then(() => {
          sinon.assert.fail('should not succeed');
        }).catch((err) => {
          const passwordErrors = err.data['password'];
          expect(passwordErrors).to.exist;
          expect(passwordErrors).to.deep.equal(['Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.']);
        });
      });

      it('should contains at least a figure', () => {
        // Given
        rawData.password = 'FFFFFFFF';
        const user = new BookshelfUser(rawData);

        // When
        const promise = user.save();

        // Then
        return promise.then(() => {
          sinon.assert.fail('should not succeed');
        }).catch((err) => {
          const passwordErrors = err.data['password'];
          expect(passwordErrors).to.exist;
          expect(passwordErrors).to.deep.equal(['Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.']);
        });
      });

      it('should be invalid when cgu are false', () => {
        // Given
        rawData.cgu = false;
        const user = new BookshelfUser(rawData);

        // When
        const promise = user.save();

        // Then
        return promise.then(() => {
          sinon.assert.fail('should not succeed');
        }).catch((err) => {
          const cguErrors = err.data['cgu'];
          expect(cguErrors).to.exist;
          expect(cguErrors).to.deep.equal(['Vous devez accepter les conditions d\'utilisation de Pix pour créer un compte.']);
        });
      });

      it('should be valid when cgu are true', () => {
        // Given
        rawData.cgu = true;
        const user = new BookshelfUser(rawData);

        // When
        const promise = user.save();

        // Then
        return promise.then((user) => {
          expect(user.get('cgu')).to.be.true;
        });
      });

      it('should be invalid when cgu are empty', () => {
        // Given
        rawData.cgu = undefined;
        const user = new BookshelfUser(rawData);

        // When
        const promise = user.save();

        // Then
        return promise.then(() => {
          sinon.assert.fail('should not succeed');
        }).catch((err) => {
          const cguErrors = err.data['cgu'];
          expect(cguErrors).to.exist;
          expect(cguErrors).to.deep.equal(['Le champ CGU doit être renseigné.']);
        });
      });

      it('is valid when everything works', () => {
        // Given
        const user = new BookshelfUser(rawData);

        // When
        const promise = user.save();

        // Then
        return promise.catch(() => {
          sinon.assert.fail('should not succeed');
        });
      });

    });

  });

});
