import { databaseBuilder, expect } from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | passage-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/passages', function () {
    it('should create a new passage and response with a 201', async function () {
      // given
      const expectedResponse = {
        type: 'passages',
        attributes: {
          'module-id': 'bien-ecrire-son-adresse-mail',
        },
      };

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/passages',
        payload: {
          data: {
            type: 'passages',
            attributes: {
              'module-id': 'bien-ecrire-son-adresse-mail',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal(expectedResponse.type);
      expect(response.result.data.id).to.exist;
      expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);
    });
  });

  describe('POST /api/passages/{passageId}/answers', function () {
    context('when given proposal is the correct answer', function () {
      const cases = [
        {
          case: 'QCU',
          elementId: '29195dde-b603-488f-a554-f391fbdf3b24',
          userResponse: ['1'],
          expectedUserResponseValue: '1',
          expectedFeedback:
            "<p class='pix-list-inline'>Oui, aucun problème ! Seuls certains caractères sont interdits, comme</p><ul><li>é</li><li>â</li><li>&</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>etc.</li></ul>",
          expectedSolution: '1',
        },
        {
          case: 'QROCM-ind',
          elementId: '8709ad92-093e-447a-a7b6-3223e6171196',
          userResponse: [{ input: 'email', answer: 'naomizao@yahoo.com' }],
          expectedUserResponseValue: { email: 'naomizao@yahoo.com' },
          expectedFeedback:
            "<p>Bravo ! <span aria-hidden='true'>🎉</span> Tout est en ordre : identifiant, arobase, fournisseur d'adresse mail</p>",
          expectedSolution: {
            email: ['naomizao@yahoo.com', 'naomizao@yahoo.fr'],
          },
        },
      ];

      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      cases.forEach((testCase, i) =>
        it(`should return a valid ${testCase.case} element answer`, async function () {
          const passage = databaseBuilder.factory.buildPassage({ id: i + 1, moduleId: 'bien-ecrire-son-adresse-mail' });
          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/passages/${passage.id}/answers`,
            payload: {
              data: {
                attributes: {
                  'element-id': testCase.elementId,
                  'user-response': testCase.userResponse,
                },
              },
            },
          };

          const response = await server.inject(options);

          expect(response.statusCode).to.equal(201);
          expect(response.result.data.type).to.equal('element-answers');
          expect(response.result.data.attributes['user-response-value']).to.deep.equal(
            testCase.expectedUserResponseValue,
          );
          expect(response.result.data.attributes['element-id']).to.equal(testCase.elementId);
          expect(response.result.included[0].attributes.status).to.equal('ok');
          expect(response.result.included[0].attributes.feedback).to.equal(testCase.expectedFeedback);
          expect(response.result.included[0].attributes.solution).to.deep.equal(testCase.expectedSolution);
        }),
      );
    });
  });
});
