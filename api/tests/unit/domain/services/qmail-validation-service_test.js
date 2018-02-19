const { expect } = require('../../../test-helper');
const qmailValidationService = require('../../../../lib/domain/services/qmail-validation-service');

describe('Unit | Service | QMail Validation', function() {

  describe('#validateEmail', () => {

    const challengeId = 'recigAYl5bl96WGXj';
    const assessmentId = 28672;
    const emailSample = {
      mail:
        {
          attachments: [],
          headers: {},
          text: 'Ouverture du bar le 12 Octobre 2017. Soyez là :)\n',
          textAsHtml: '<p>Ouverture du bar le 12 Octobre 2017. Soyez là :)</p>',
          subject: 'Invitation - Ouverture du bar commun ',
          date: '2017-10-10T15:17:36.000Z',
          to:
            {
              value: [],
              html: `<span class="mp_address_group"><a href="mailto:${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr" class="mp_address_email">${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr</a></span>`,
              text: `${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr`
            },
          from:
            {
              value: [],
              html: '<span class="mp_address_group"><a href="mailto:test@example.net" class="mp_address_email">test@example.net</a></span>',
              text: 'test@example.net'
            },
          messageId: '<561863.073703961-sendEmail@octo-asa>',
          html: false
        },
      headers:
        {
          'message-id': '<561863.073703961-sendEmail@octo-asa>',
          from:
            {
              value: [],
              html: '<span class="mp_address_group"><a href="mailto:test@example.net" class="mp_address_email">test@example.net</a></span>',
              text: 'test@example.net'
            },
          to:
            {
              value: [],
              html: `<span class="mp_address_group"><a href="mailto:${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr" class="mp_address_email">${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr</a></span>`,
              text: `${challengeId}-${assessmentId}-0609@pix.beta.gouv.fr`
            },
          subject: 'Invitation - Ouverture du bar commun ',
          date: '2017-10-10T15:17:36.000Z',
          'x-mailer': 'sendEmail-1.56',
          'mime-version': '1.0',
          'content-type': { value: 'multipart/related', params: [] }
        }
    };

    it('should validate the email when no rules defined', () => {
      // When
      const isEmailValid = qmailValidationService.validateEmail(emailSample, '');

      // Then
      expect(isEmailValid).to.be.true;
    });

    describe('when testing a field', () => {

      describe('with CONTIENT keyword', () => {

        describe('when the email field contains the given word', () => {
          it('should valid the email on subject', () => {
            // Given
            const rulesInYaml = '--- \n' +
              'SUJET: \n' +
              '  CONTIENT: commun\n';

            // When
            const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

            // Then
            expect(isEmailValid).to.equal(true);
          });
        });

        describe('when the searched expression is not found', () => {
          it('should invalid the email\'s subject', () => {
            // Given
            const rulesInYaml = '--- \n' +
              'SUJET: \n' +
              '  CONTIENT: "pot commun"\n';

            // When
            const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

            // Then
            expect(isEmailValid).to.equal(false);
          });

          it('should invalid the email\'s content', () => {
            // Given
            const rulesInYaml = '--- \n' +
              'CORPS: \n' +
              '  CONTIENT: commun\n';

            // When
            const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

            // Then
            expect(isEmailValid).to.equal(false);
          });

        });

      });

      describe('with EST keyword', () => {
        it('should valid the email when the email is as expected', () => {
          // Given
          const rulesInYaml = '--- \n' +
            'SUJET: \n' +
            '  EST: "Invitation - Ouverture du bar commun"\n';

          // When
          const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

          // Then
          expect(isEmailValid).to.equal(true);
        });

      });

    });

    describe('when using ET pre-condition', () => {

      it('should reject the email when the subject is different than expected', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'ET: \n' +
          '  SUJET: \n' +
          '    EST: "recette de grand mère"\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(false);
      });

      describe('on multiple fields', () => {

        it('should valid when both fields are validated', () => {
          // Given
          const rulesInYaml = '--- \n' +
            'ET: \n' +
            '  SUJET: \n' +
            '    CONTIENT: "Invitation"\n' +
            '  CORPS: \n' +
            '    CONTIENT: "Octobre"\n';

          // When
          const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

          // Then
          expect(isEmailValid).to.equal(true);
        });

      });

      it('should work with AND if the ET is missing', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'SUJET: \n' +
          '  CONTIENT: "Invitation"\n' +
          'CORPS: \n' +
          '  CONTIENT: "Octobre"\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });

    });

    describe('when using OU pre-condition', () => {
      it('should valid the email when both rules are validated', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'OU: \n' +
          '  SUJET: \n' +
          '    CONTIENT: "Poisson"\n' +
          '  CORPS: \n' +
          '    CONTIENT: "Octobre"\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });

      it('should validate the email when at least one condition is OK', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'OU: \n' +
          '  CORPS: \n' +
          '    CONTIENT: "Ouverture du bar"\n' +
          '  SUJET: \n' +
          '    EST: TOTO\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });

    });

    describe('ET logical condition', () => {
      it('should invalid the email when it rejects every condition', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'CORPS: \n' +
          '  ET: \n' +
          '    - \n' +
          '      CONTIENT: Jambon\n' +
          '    - \n' +
          '      CONTIENT: Chaussette\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(false);
      });

      it('should invalid the email when at least one condition is rejected', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'CORPS: \n' +
          '  ET: \n' +
          '    - \n' +
          '      CONTIENT: DHU\n' +
          '    - \n' +
          '      CONTIENT: bar\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(false);
      });

      it('should validate the email when every condition is OK', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'CORPS: \n' +
          '  ET: \n' +
          '    - \n' +
          '      CONTIENT: "12 Octobre"\n' +
          '    - \n' +
          '      CONTIENT: "Soyez là"\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });

      it('should validate the email when no condition is given', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'CORPS: \n' +
          '  ET: \n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });

      it('shoud work on a multiple level', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'CORPS: \n' +
          '  ET: \n' +
          '    - \n' +
          '      CONTIENT: Ouverture\n' +
          '    - \n' +
          '      ET: \n' +
          '        - \n' +
          '          CONTIENT: Octobre\n' +
          '        - \n' +
          '          CONTIENT: 12\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });
    });

    describe('OU logical condition', () => {
      it('should valid the email when the email\'s suject contains one of the given words', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'SUJET: \n' +
          '  OU: \n' +
          '    - \n' +
          '      CONTIENT: bar\n' +
          '    - \n' +
          '      CONTIENT: poisson\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });

      it('shoud work on a multiple level', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'SUJET: \n' +
          '  OU: \n' +
          '    - \n' +
          '      CONTIENT: Chocolat\n' +
          '    - \n' +
          '      CONTIENT: Café\n' +
          '    - \n' +
          '      ET: \n' +
          '        - \n' +
          '          CONTIENT: "bar commun"\n' +
          '        - \n' +
          '          CONTIENT: Ouverture\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });
    });

    describe('when making combination of multiple conditions', () => {

      it('should validate the email', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'OU: \n' +
          '  SUJET: \n' +
          '    ET: \n' +
          '      - \n' +
          '        CONTIENT: TOTO\n' +
          '      - \n' +
          '        CONTIENT: Invitation\n' +
          '  CORPS: \n' +
          '    CONTIENT: Octobre\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });

      it('should work on a 5 level conditions', () => {
        // Given
        const rulesInYaml = '--- \n' +
          'OU: \n' +
          '  - \n' +
          '    ET: \n' +
          '      CORPS: \n' +
          '        CONTIENT: Champion\n' +
          '      SUJET: \n' +
          '        ET: \n' +
          '          - \n' +
          '            CONTIENT: Invitation\n' +
          '          - \n' +
          '            CONTIENT: Ouverture\n' +
          '  - \n' +
          '    ET: \n' +
          '      CORPS: \n' +
          '        CONTIENT: "Soyez là"\n';

        // When
        const isEmailValid = qmailValidationService.validateEmail(emailSample, rulesInYaml);

        // Then
        expect(isEmailValid).to.equal(true);
      });
    });
  });

});
