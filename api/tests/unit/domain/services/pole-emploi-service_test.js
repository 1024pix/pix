const { expect } = require('../../../test-helper');
const poleEmploiService = require('../../../../lib/domain/services/pole-emploi-service');
const settings = require('../../../../lib/config');

describe('Unit | Service | Pole Emploi Service', function() {
  describe('#generateLink', function() {
    const originalEnv = settings.apiManager.url;

    before(() => {
      settings.apiManager.url = 'https://url-externe';
    });

    after(() => {
      settings.apiManager.url = originalEnv;
    });

    it('should generate a link', function() {
      const sending = {
        idEnvoi: 456,
        dateEnvoi: '2021-05-01T00:00:00.000Z',
        resultat: { } };

      // when
      const generatedLink = poleEmploiService.generateLink(sending);

      // then
      expect(generatedLink).to.equal('https://url-externe/pole-emploi/envois?curseur=eyJpZEVudm9pIjo0NTYsImRhdGVFbnZvaSI6IjIwMjEtMDUtMDFUMDA6MDA6MDAuMDAwWiJ9');
    });

    context('when there is a filter', () => {
      context('when isSuccessful is true', () => {
        it('should generate a link with a query params using the filters', function() {
          const sending = {
            idEnvoi: 456,
            dateEnvoi: '2021-05-01T00:00:00.000Z',
            resultat: { } };

          const filters = {
            isSuccessful: true,
          };

          // when
          const generatedLink = poleEmploiService.generateLink(sending, filters);

          // then
          expect(generatedLink).to.equal('https://url-externe/pole-emploi/envois?curseur=eyJpZEVudm9pIjo0NTYsImRhdGVFbnZvaSI6IjIwMjEtMDUtMDFUMDA6MDA6MDAuMDAwWiJ9&enErreur=false');
        });
      });
      context('when isSuccessful is false', () => {
        it('should generate a link with a query params using the filters', function() {
          const sending = {
            idEnvoi: 456,
            dateEnvoi: '2021-05-01T00:00:00.000Z',
            resultat: { } };

          const filters = {
            isSuccessful: false,
          };

          // when
          const generatedLink = poleEmploiService.generateLink(sending, filters);

          // then
          expect(generatedLink).to.equal('https://url-externe/pole-emploi/envois?curseur=eyJpZEVudm9pIjo0NTYsImRhdGVFbnZvaSI6IjIwMjEtMDUtMDFUMDA6MDA6MDAuMDAwWiJ9&enErreur=true');
        });
      });
    });
  });

  describe('#decodeCursor', function() {
    context('when there is a cursor', ()=> {
      it('should decode the cursor', function() {
        const cursor = poleEmploiService.generateCursor({ idEnvoi: 456, dateEnvoi: '2021-05-01T00:00:00.000Z' });
        const decodedData = poleEmploiService.decodeCursor(cursor);

        expect(decodedData).to.deep.equal({ idEnvoi: 456, dateEnvoi: '2021-05-01T00:00:00.000Z' });
      });
    });

    context('when the parameter is undefined', ()=> {
      it('should return null', function() {
        const str = undefined;
        const decodedData = poleEmploiService.decodeCursor(str);

        expect(decodedData).to.deep.equal(null);
      });
    });
  });
});
