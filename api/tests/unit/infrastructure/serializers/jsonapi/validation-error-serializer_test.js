import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer';
import Bookshelf from '../../../../../lib/infrastructure/bookshelf';

describe('Unit | Serializer | JSONAPI | validation-error-serializer', function () {
  describe('#serialize', function () {
    let DummyObject;

    before(function () {
      DummyObject = Bookshelf.Model.extend({
        validations: {
          email: [{ method: 'isEmail', error: 'Not a valid email address' }],
          age: [
            { method: 'isInt', error: 'You cant be so old', args: { min: 10, max: 99 } },
            { method: 'isLength', error: 'Age can only be two digits', args: { min: 0, max: 2 } },
          ],
        },
      });
    });

    it('should format a validation error into a JSON spec', function () {
      // given
      const invalidObject = new DummyObject({
        email: 'testThatIsNotAnEmail',
      });
      const expectedFormattedJSON = {
        errors: [
          {
            status: '400',
            title: 'Invalid Attribute',
            detail: 'Not a valid email address',
            source: { pointer: '/data/attributes/email' },
            meta: {
              field: 'email',
            },
          },
        ],
      };

      // when
      const promise = invalidObject.save();

      // then
      return promise.catch((validationErrors) => {
        const formattedJSON = serializer.serialize(validationErrors);

        expect(formattedJSON).to.deep.equal(expectedFormattedJSON);
      });
    });

    it('should format a validation error into a JSON:API spec with kebab-case on source pointer', function () {
      // given
      const validationErrors = {
        data: {
          firstName: ['Error message'],
        },
      };
      const expectedFormattedJSON = {
        errors: [
          {
            status: '400',
            title: 'Invalid Attribute',
            detail: 'Error message',
            source: { pointer: '/data/attributes/first-name' },
            meta: {
              field: 'firstName',
            },
          },
        ],
      };

      // when
      const formattedJSON = serializer.serialize(validationErrors);

      // then
      expect(formattedJSON).to.deep.equal(expectedFormattedJSON);
    });

    it('should return several messages for one field if they exist', function () {
      // given
      const validationErrors = {
        data: {
          field: ['Error message #1', 'Error message #2', 'Error message #3'],
        },
      };
      const expectedFormattedJSON = {
        errors: [
          {
            status: '400',
            title: 'Invalid Attribute',
            detail: 'Error message #1',
            source: { pointer: '/data/attributes/field' },
            meta: {
              field: 'field',
            },
          },
          {
            status: '400',
            title: 'Invalid Attribute',
            detail: 'Error message #2',
            source: { pointer: '/data/attributes/field' },
            meta: {
              field: 'field',
            },
          },
          {
            status: '400',
            title: 'Invalid Attribute',
            detail: 'Error message #3',
            source: { pointer: '/data/attributes/field' },
            meta: {
              field: 'field',
            },
          },
        ],
      };

      // when
      const formattedJSON = serializer.serialize(validationErrors);

      // then
      expect(formattedJSON).to.deep.equal(expectedFormattedJSON);
    });

    it('should format a validation error into a JSON spec when multiple errors', function () {
      // given
      const invalidObject = new DummyObject({
        email: 'test@example.net',
        age: '200',
      });

      const expectedFormattedJSON = {
        errors: [
          {
            status: '400',
            title: 'Invalid Attribute',
            detail: 'You cant be so old',
            source: { pointer: '/data/attributes/age' },
            meta: {
              field: 'age',
            },
          },
          {
            status: '400',
            title: 'Invalid Attribute',
            detail: 'Age can only be two digits',
            source: { pointer: '/data/attributes/age' },
            meta: {
              field: 'age',
            },
          },
        ],
      };

      // when
      const promise = invalidObject.save();

      // then
      return promise.catch((validationErrors) => {
        const formattedJSON = serializer.serialize(validationErrors);

        expect(formattedJSON).to.deep.equal(expectedFormattedJSON);
      });
    });

    it('should format a validation error into Json Spec when invalid captcha response', function () {
      // given
      const invalidCaptchaResponse = {
        data: {
          captchaResponse: ['Le captcha est invalide.'],
        },
      };

      const expectJsonFormat = {
        errors: [
          {
            detail: 'Le captcha est invalide.',
            meta: {
              field: 'captchaResponse',
            },
            source: {
              pointer: '/data/attributes/captcha-response',
            },
            status: '400',
            title: 'Invalid Attribute',
          },
        ],
      };
      // when
      const formattedJSON = serializer.serialize(invalidCaptchaResponse);

      // then
      expect(formattedJSON).to.deep.equal(expectJsonFormat);
    });

    it('should format a validation error into a JSON spec when generic error', function () {
      // given
      const errors = {
        data: {
          '': ["L'adresse e-mail ou l'identifiant et/ou le mot de passe saisi(s) sont incorrects."],
        },
      };

      const expectedFormattedJSON = {
        errors: [
          {
            status: '400',
            title: 'Invalid Payload',
            detail: "L'adresse e-mail ou l'identifiant et/ou le mot de passe saisi(s) sont incorrects.",
            source: { pointer: '/data/attributes' },
          },
        ],
      };

      // when
      const formattedJSON = serializer.serialize(errors);

      // then
      expect(formattedJSON).to.deep.equal(expectedFormattedJSON);
    });
  });
});
