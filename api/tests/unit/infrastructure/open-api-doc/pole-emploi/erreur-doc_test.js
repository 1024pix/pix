const ErreurDoc = require('../../../../../lib/infrastructure/open-api-doc/pole-emploi/erreur-doc');
const { expect } = require('../../../../test-helper');

describe('Unit | Infrastructure | Open API Doc | Pole Emploi | Erreur Documentation', function () {
  it('should validate payload for a campaign participation', function () {
    // given
    const payload = {
      code: 'A1',
      titre: "Titre de l'erreur",
      statut: '400',
      detail: "Description de l'erreur",
    };

    // when
    const result = ErreurDoc.validate(payload);

    // then
    expect(result.error).to.be.undefined;
  });
});
