const { describe, it, expect, sinon, beforeEach } = require('../../../test-helper');

const BookshelfSession = require('../../../../lib/infrastructure/data/session');

describe('Unit | Infrastructure | Models | BookshelfSession', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        certificationCenter: 'Univeristé Sophia Anti-polis',
        address: 'Nice',
        examiner: 'Babar',
        room: '007',
        date: '2017-04-20',
        time: '22:32',
        description: ''
      };
    });

    it('should fail when the certificationCenter is empty', () => {
      // Given
      rawData.certificationCenter = '';
      const session = new BookshelfSession(rawData);

      // When
      const promise = session.save();

      // Then
      return promise
        .catch((err) => {
          const certificationCenterError = err.data['certificationCenter'];
          expect(certificationCenterError).to.exist;

          expect(certificationCenterError).to.deep.equal(['Vous n\'avez pas renseigné de centre de certification.']);
        });
    });

    it('should fail when the address is empty', () => {
      // Given
      rawData.address = '';
      const session = new BookshelfSession(rawData);

      // When
      const promise = session.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail();
        })
        .catch((err) => {
          const addressError = err.data['address'];
          expect(addressError).to.exist;

          expect(addressError).to.deep.equal(['Vous n\'avez pas renseigné d\'adresse.']);
        });
    });

    it('should fail when the examiner is empty', () => {
      // Given
      rawData.examiner = '';
      const session = new BookshelfSession(rawData);

      // When
      const promise = session.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail();
        })
        .catch((err) => {
          const examinerError = err.data['examiner'];
          expect(examinerError).to.exist;

          expect(examinerError).to.deep.equal(['Vous n\'avez pas renseigné d\'examinateur.']);
        });
    });

    it('should fail when the room is empty', () => {
      // Given
      rawData.room = '';
      const session = new BookshelfSession(rawData);

      // When
      const promise = session.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail();
        })
        .catch((err) => {
          const roomError = err.data['room'];
          expect(roomError).to.exist;

          expect(roomError).to.deep.equal(['Vous n\'avez pas renseigné de salle.']);
        });
    });

    it('should fail when the date is empty or not in format (jj/mm/yyyy)', () => {
      // Given
      rawData.date = '';
      const session = new BookshelfSession(rawData);

      // When
      const promise = session.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail();
        })
        .catch((err) => {
          const dateError = err.data['date'];
          expect(dateError).to.exist;

          expect(dateError).to.deep.equal(['Veuillez renseigner une date de session au format (jj/mm/yyyy).']);
        });
    });

    it('should fail when the date is invalid', () => {
      // Given
      rawData.date = '2017-01-20';
      const session = new BookshelfSession(rawData);

      // When
      const promise = session.save();

      // Then
      return expect(promise).not.to.be.rejected;
    });

    it('should fail when the time is empty or not in format (hh:mm)', () => {
      // Given
      rawData.time = '';
      const session = new BookshelfSession(rawData);

      // When
      const promise = session.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail();
        })
        .catch((err) => {
          const timeError = err.data['time'];
          expect(timeError).to.exist;

          expect(timeError).to.deep.equal(['Veuillez renseigner une heure de session au format (hh:mm).']);
        });
    });

  });
});
