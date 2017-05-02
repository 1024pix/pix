const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const Bookshelf = require('../../../../../lib/infrastructure/bookshelf');
const validator = require('validator');

describe('Unit | Serializer | JSONAPI | validation-error-serializer', () => {

  describe('#serialize', () => {

    let DummyObject;

    before(() => {
      DummyObject = Bookshelf.Model.extend({
        validations: {
          email: [
            { method: 'isEmail', error: 'Not a valid email address' }
          ],
          age: [
            { method: 'isInt' , error: 'You cant be so old', args: { min: 10, max: 99 } },
            { method: 'isLength' , error: 'Age can only be two digits', args: { min: 0, max: 2 } }
          ]
        }
      });
    });

    it('should format a validation error into a JSON spec', () => {
      // Given
      const invalidObject = new DummyObject({
        email: 'testThatIsNotAnEmail'
      });
      const expectedFormattedJSON = {
        "errors": [
          {
            "status": "400",
            "title":  "Invalid Attribute",
            "details": "Not a valid email address",
            "source": { "pointer": "/data/attributes/email" },
            "meta": {
              "field": "email"
            }
          }
        ]
      };

      // When
      const promise = invalidObject.save();

      // Then
      return promise.catch((validationErrors) => {
        const formattedJSON = serializer.serialize(validationErrors);

        expect(formattedJSON).to.deep.equal(expectedFormattedJSON);
      });
    });


    it('should format a validation error into a JSON spec when multiple errors', () => {
      // Given
      const invalidObject = new DummyObject({
        email: 'test@example.net',
        age: "200"
      });

      const expectedFormattedJSON = {
        "errors": [
          {
            "status": "400",
            "title":  "Invalid Attribute",
            "details": "You cant be so old",
            "source": { "pointer": "/data/attributes/age" },
            "meta": {
              "field": "age"
            }
          },
          {
            "status": "400",
            "title":  "Invalid Attribute",
            "details": "Age can only be two digits",
            "source": { "pointer": "/data/attributes/age" },
            "meta": {
              "field": "age"
            }
          }
        ]
      };

      // When
      const promise = invalidObject.save();

      // Then
      return promise.catch((validationErrors) => {
        const formattedJSON = serializer.serialize(validationErrors);

        expect(formattedJSON).to.deep.equal(expectedFormattedJSON);
      });
    });

  });



});
