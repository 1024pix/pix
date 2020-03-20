const { expect } = require('chai');

const JSONAPI = require('../../../../lib/interfaces/jsonapi');

describe('Unit | Interfaces | JSONAPI | Unprocessable Entity Error', () => {

  it('should create a new JSONAPI unprocessable entity error with invalid data attribute', () => {
    // given
    const invalidAttributes = [
      {
        attribute: 'firstname',
        message: 'Le prénom n’est pas renseigné.',
      }
    ];

    // when
    const jsonApiUnprocessableError = JSONAPI.unprocessableEntityError(invalidAttributes);

    // then
    expect(jsonApiUnprocessableError.errors).to.have.lengthOf(1);

    const unprocessableErrorOnFirstname = jsonApiUnprocessableError.errors[0];
    expect(unprocessableErrorOnFirstname.status).to.equal('422');
    expect(unprocessableErrorOnFirstname.source.pointer).to.equal('/data/attributes/firstname');
    expect(unprocessableErrorOnFirstname.title).to.equal('Invalid data attribute "firstname"');
    expect(unprocessableErrorOnFirstname.detail).to.equal('Le prénom n’est pas renseigné.');
  });

  it('should create a new JSONAPI unprocessable entity error with invalid relationships if name ends with Id', () => {
    // given
    const invalidAttributes = [
      {
        attribute: 'targetProfileId',
        message: 'Le profile cible n’est pas renseigné.',
      }
    ];

    // when
    const jsonApiUnprocessableError = JSONAPI.unprocessableEntityError(invalidAttributes);

    // then
    expect(jsonApiUnprocessableError.errors).to.have.lengthOf(1);

    const unprocessableErrorOnFirstname = jsonApiUnprocessableError.errors[0];
    expect(unprocessableErrorOnFirstname.status).to.equal('422');
    expect(unprocessableErrorOnFirstname.source.pointer).to.equal('/data/relationships/target-profile');
    expect(unprocessableErrorOnFirstname.title).to.equal('Invalid relationship "targetProfile"');
    expect(unprocessableErrorOnFirstname.detail).to.equal('Le profile cible n’est pas renseigné.');
  });

  it('should create a new JSONAPI unprocessable entity error with invalid data attribute, if attribute is undefined', () => {
    // given
    const invalidAttributes = [
      {
        attribute: undefined,
        message: 'Vous devez renseigner une adresse e-mail et/ou un identifiant.',
      }
    ];

    // when
    const jsonApiUnprocessableError = JSONAPI.unprocessableEntityError(invalidAttributes);

    // then
    expect(jsonApiUnprocessableError.errors).to.have.lengthOf(1);

    const unprocessableErrorOnFirstname = jsonApiUnprocessableError.errors[0];
    expect(unprocessableErrorOnFirstname.status).to.equal('422');
    expect(unprocessableErrorOnFirstname.source).to.be.undefined;
    expect(unprocessableErrorOnFirstname.title).to.equal('Invalid data attributes');
    expect(unprocessableErrorOnFirstname.detail).to.equal('Vous devez renseigner une adresse e-mail et/ou un identifiant.');
  });

  it('should create a new JSONAPI unprocessable with multiple invalid attributes', () => {
    // given
    const invalidAttributes = [
      {
        attribute: 'firstname',
        message: 'Le prénom n’est pas renseigné.',
      },
      {
        attribute: 'lastname',
        message: 'Le nom n’est pas renseigné.',
      },
      {
        attribute: 'targetProfileId',
        message: 'Le profile cible n’est pas renseigné.',
      },
    ];

    // when
    const jsonApiUnprocessableError = JSONAPI.unprocessableEntityError(invalidAttributes);

    // then
    expect(jsonApiUnprocessableError.errors).to.have.lengthOf(3);
  });

});
