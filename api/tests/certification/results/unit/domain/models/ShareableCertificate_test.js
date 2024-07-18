import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Results | Unit | Domain | Models | ShareableCertificate', function () {
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
