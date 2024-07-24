import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Routes | Certification Course', function () {
  describe('PATCH /api/admin/certification-courses/{certificationCourseId}', function () {
    context('when the user does not have role super admin', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        const server = await createServer();

        const options = {
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          method: 'PATCH',
          url: '/api/admin/certification-courses/1',
          payload: {
            data: {},
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the user does have role super admin', function () {
      let options;
      let certificationCourseId;
      let server;

      beforeEach(async function () {
        server = await createServer();
        await insertUserWithRoleSuperAdmin();
        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99100',
          commonName: 'FRANCE',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCity({
          name: 'CHATILLON EN MICHAILLE',
          INSEECode: '01091',
          isActualName: true,
        });
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          verificationCode: 'ABCD123',
          createdAt: new Date('2019-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
          sex: 'F',
        }).id;

        options = {
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          method: 'PATCH',
          url: `/api/admin/certification-courses/${certificationCourseId}`,
          payload: {
            data: {
              type: 'certifications',
              id: certificationCourseId,
              attributes: {
                'first-name': 'Freezer',
                'last-name': 'The all mighty',
                birthplace: null,
                birthdate: '1989-10-24',
                'external-id': 'xenoverse2',
                sex: 'M',
                'birth-country': 'FRANCE',
                'birth-insee-code': '01091',
                'birth-postal-code': null,
              },
            },
          },
        };

        return databaseBuilder.commit();
      });

      it('should update the certification course', async function () {
        // when
        const response = await server.inject(options);

        // then
        const result = response.result.data;
        expect(result.attributes['first-name']).to.equal('Freezer');
        expect(result.attributes['last-name']).to.equal('The all mighty');
        expect(result.attributes['birthplace']).to.equal('CHATILLON EN MICHAILLE');
        expect(result.attributes['birthdate']).to.equal('1989-10-24');
        expect(result.attributes['sex']).to.equal('M');
        expect(result.attributes['birth-country']).to.equal('FRANCE');
        expect(result.attributes['birth-insee-code']).to.equal('01091');
        expect(result.attributes['birth-postal-code']).to.be.null;
        const { version, verificationCode } = await knex
          .select('version', 'verificationCode')
          .from('certification-courses')
          .where({ id: certificationCourseId })
          .first();
        expect(version).to.equal(2);
        expect(verificationCode).to.equal('ABCD123');
      });

      context('when birthdate is not a date', function () {
        it('should return a wrong format error', async function () {
          // given
          options.payload.data.attributes.birthdate = 'aaaaaaa';

          // when
          const error = await server.inject(options);

          // then
          expect(error.statusCode).to.be.equal(400);
        });
      });
    });
  });
});
