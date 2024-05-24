import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | passage-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/passages', function () {
    describe('when user is not authenticated', function () {
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

    describe('when user is authenticated', function () {
      it('should create a new passage and response with a 201', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();
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
          headers: {
            authorization: generateValidRequestAuthorizationHeader(user.id),
          },
        });

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal(expectedResponse.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);

        const { userId } = await knex('passages').where({ id: response.result.data.id }).first();
        expect(userId).to.equal(user.id);
      });
    });
  });

  describe('POST /api/passages/{passageId}/answers', function () {
    context('when given proposal is the correct answer', function () {
      const cases = [
        {
          case: 'QCU',
          moduleId: 'bien-ecrire-son-adresse-mail',
          elementId: '29195dde-b603-488f-a554-f391fbdf3b24',
          userResponse: ['1'],
          expectedUserResponseValue: '1',
          expectedFeedback:
            '<p class="pix-list-inline">Oui, aucun problème&#8239;! Seuls certains caractères sont interdits, comme</p><ul><li>é</li><li>â</li><li>&amp;</li><li>@</li><li>$</li><li>*</li><li>€</li><li>£</li><li>etc.</li></ul>',
          expectedSolution: '1',
        },
        {
          case: 'QROCM-ind',
          moduleId: 'bien-ecrire-son-adresse-mail',
          elementId: '8709ad92-093e-447a-a7b6-3223e6171196',
          userResponse: [{ input: 'email', answer: 'naomizao457@yahoo.com' }],
          expectedUserResponseValue: { email: 'naomizao457@yahoo.com' },
          expectedFeedback:
            '<span class="feedback__state">Correct.&nbsp;<span aria-hidden="true">🎉</span></span><p>Tout est dans l\'ordre&nbsp;: l\'identifiant, l\'arobase puis le fournisseur d\'adresse mail</p>',
          expectedSolution: {
            email: ['naomizao457@yahoo.com', 'naomizao457@yahoo.fr'],
          },
        },
        {
          case: 'QCM',
          moduleId: 'didacticiel-modulix',
          elementId: '30701e93-1b4d-4da4-b018-fa756c07d53f',
          userResponse: ['1', '3', '4'],
          expectedUserResponseValue: ['1', '3', '4'],
          expectedFeedback: '<p>Correct&#8239;! Vous nous avez bien cernés&nbsp;:)</p>',
          expectedSolution: ['1', '3', '4'],
        },
      ];

      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      cases.forEach((testCase, i) =>
        it(`should return a valid ${testCase.case} element answer`, async function () {
          const passage = databaseBuilder.factory.buildPassage({ id: i + 1, moduleId: testCase.moduleId });
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

  describe('POST /api/passages/{passageId}/terminate', function () {
    context('when passage is already terminated', function () {
      it('should return a 412', async function () {
        const passage = databaseBuilder.factory.buildPassage({ terminatedAt: new Date() });
        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: `/api/passages/${passage.id}/terminate`,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(412);
      });
    });

    context('when passage is not terminated', function () {
      it('should return a 200 and terminate passage', async function () {
        const passage = databaseBuilder.factory.buildPassage();
        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: `/api/passages/${passage.id}/terminate`,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        const { terminatedAt } = await knex('passages').where({ id: passage.id }).first();
        expect(terminatedAt).to.be.not.null;
      });
    });
  });
});
