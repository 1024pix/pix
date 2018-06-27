const { expect } = require('chai');

const JSONAPI = require('../../../../lib/interfaces/jsonapi');

describe('Unit | Interfaces | JSONAPI | Unprocessable Entity Error', () => {

  it('should create a new JSONAPI unprocessable entity error with the given invalid attributes', () => {
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
    ];

    // when
    const jsonApiUnprocessableError = JSONAPI.unprocessableEntityError(invalidAttributes);

    // then
    expect(jsonApiUnprocessableError.errors).to.have.lengthOf(2);

    const unprocessableErrorOnFirstname = jsonApiUnprocessableError.errors[0];
    expect(unprocessableErrorOnFirstname.status).to.equal('422');
    expect(unprocessableErrorOnFirstname.source.pointer).to.equal('/data/attributes/firstname');
    expect(unprocessableErrorOnFirstname.title).to.equal('Invalid data attribute "firstname"');
    expect(unprocessableErrorOnFirstname.detail).to.equal('Le prénom n’est pas renseigné.');

    const unprocessableErrorOnLastname = jsonApiUnprocessableError.errors[1];
    expect(unprocessableErrorOnLastname.status).to.equal('422');
    expect(unprocessableErrorOnLastname.source.pointer).to.equal('/data/attributes/lastname');
    expect(unprocessableErrorOnLastname.title).to.equal('Invalid data attribute "lastname"');
    expect(unprocessableErrorOnLastname.detail).to.equal('Le nom n’est pas renseigné.');
  });

});
