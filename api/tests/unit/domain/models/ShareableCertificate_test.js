const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | ShareableCertificate', () => {

  context('#setResultCompetenceTree', () => {

    it('should set the resultCompetenceTree on ShareableCertificate model', () => {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'someId' });
      const shareableCertificate = domainBuilder.buildShareableCertificate();

      // when
      shareableCertificate.setResultCompetenceTree(resultCompetenceTree);

      // expect
      expect(shareableCertificate.resultCompetenceTree).to.deep.equal(resultCompetenceTree);
    });
  });
});
