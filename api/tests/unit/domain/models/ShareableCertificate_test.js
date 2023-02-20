import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | Domain | Models | ShareableCertificate', function () {
  context('#setResultCompetenceTree', function () {
    it('should set the resultCompetenceTree on ShareableCertificate model', function () {
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
