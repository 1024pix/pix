const { expect } = require('../../../../test-helper');
const insertSessionData = require('../../../../../lib/domain/services/get-attendance-sheet/insert-session-data-into-xml');

describe('Unit | Services | get-attendance-sheet | insert-session-data-into-xml', () => {

  const session = {
    id: 1,
    address: 'Rue de bercy',
    room: 'Salle 2',
    examiner: 'Benoit',
    date: '2018-01-15',
    time: '14:00:00',
    certificationCenter: 'Tour Gamma',
  };

  const stringifiedXml =
    '<xml xmlns:some="" xmlns:text="">' +
    '<some:element>' +
    '<text:p>SESSION_ID</text:p>' +
    '<text:p>SESSION_ROOM</text:p>' +
    '</some:element>' +
    '<text:p>SESSION_EXAMINER</text:p>' +
    '<text:p>SESSION_START_DATE</text:p>' +
    '<text:p>SESSION_START_TIME</text:p>' +
    '<text:p>SESSION_END_TIME</text:p>' +
    '<text:p>SESSION_ADDRESS</text:p>' +
    '<text:p>CERTIFICATION_CENTER_NAME</text:p>' +
    '</xml>';

  const updatedStringifiedXml =
    '<xml xmlns:some="" xmlns:text="">' +
    '<some:element>' +
    '<text:p>1</text:p>' +
    '<text:p>Salle 2</text:p>' +
    '</some:element>' +
    '<text:p>Benoit</text:p>' +
    '<text:p>15/01/2018</text:p>' +
    '<text:p>14:00</text:p>' +
    '<text:p>16:00</text:p>' +
    '<text:p>Rue de bercy</text:p>' +
    '<text:p>Tour Gamma</text:p>' +
    '</xml>';

  describe('insertSessionDataIntoXml', () => {

    it('should return the content.xml file filled with correct session data', () => {
      // when
      const result = insertSessionData({
        stringifiedXml,
        session
      });

      // then
      expect(result).to.deep.equal(updatedStringifiedXml);
    });

    it('should not replace static values', () => {
      // given
      const stringifiedXml =
        '<xml xmlns:text="">' +
        '<text:p>Ceci est un texte statique</text:p>' +
        '<text:p>un autre texte statique</text:p>' +
        '</xml>';

      // when
      const result = insertSessionData({
        stringifiedXml,
        session
      });

      // then
      expect(result).to.deep.equal(stringifiedXml);
    });

  });

});
