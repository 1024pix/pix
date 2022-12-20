const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const targetProfilesRouter = require('../../../../lib/application/target-profiles');
const { NotFoundError } = require('../../../../lib/domain/errors');
const TargetProfileForAdminNewFormat = require('../../../../lib/domain/models/TargetProfileForAdminNewFormat');

describe('Integration | Application | Route | target-profile-router', function () {
  let httpTestServer;
  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(targetProfilesRouter);
    sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
  });

  describe('GET api/admin/target-profiles/{id}', function () {
    it('should return a target profile', async function () {
      // given
      const area = domainBuilder.buildArea({
        id: 'recArea1',
        title: 'Super domaine',
        color: 'blue',
        code: 'lyoko',
        frameworkId: 'recFrameworkCool1',
      });
      const targetProfileForAdminNewFormat = new TargetProfileForAdminNewFormat({
        id: 132,
        name: 'Mon Super profil cible',
        outdated: true,
        isPublic: true,
        createdAt: new Date('2021-03-02'),
        ownerOrganizationId: 12,
        description: 'Un super profil cible',
        comment: 'commentaire',
        imageUrl: 'some/image/url',
        category: 'OTHER',
        isSimplifiedAccess: true,
        badges: [],
        areas: [area],
        competences: [
          domainBuilder.buildCompetence({
            id: 'recComp1',
            area,
            areaId: area.id,
            name: 'Super compétence',
            index: '1.1',
          }),
        ],
        thematics: [
          domainBuilder.buildThematic({
            id: 'recThem1',
            competenceId: 'recComp1',
            name: 'Super thématique',
            index: '5',
          }),
        ],
        tubes: [
          {
            ...domainBuilder.buildTube({
              id: 'recTube1',
              name: '@nomTube',
              practicalTitle: 'Super tube',
              isMobileCompliant: true,
              isTabletCompliant: false,
            }),
            thematicId: 'recThem1',
            level: 8,
          },
        ],
      });

      sinon
        .stub(usecases, 'getTargetProfileForAdmin')
        .withArgs({ targetProfileId: 123 })
        .resolves(targetProfileForAdminNewFormat);

      // when
      const response = await httpTestServer.request('GET', `/api/admin/target-profiles/123`);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'target-profiles',
          id: '132',
          attributes: {
            'is-new-format': true,
            name: 'Mon Super profil cible',
            outdated: true,
            'is-public': true,
            'created-at': new Date('2021-03-02'),
            'owner-organization-id': 12,
            description: 'Un super profil cible',
            comment: 'commentaire',
            'image-url': 'some/image/url',
            category: 'OTHER',
            'is-simplified-access': true,
            'max-level': 8,
          },
          relationships: {
            badges: {
              data: [],
            },
            stages: {
              links: {
                related: '/api/admin/target-profiles/132/stages',
              },
            },
            'new-areas': {
              data: [
                {
                  type: 'newAreas',
                  id: 'recArea1',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'new-tubes',
            id: 'recTube1',
            attributes: {
              name: '@nomTube',
              'practical-title': 'Super tube',
              level: 8,
              mobile: true,
              tablet: false,
            },
          },
          {
            type: 'new-thematics',
            id: 'recThem1',
            attributes: {
              name: 'Super thématique',
              index: '5',
            },
            relationships: {
              tubes: {
                data: [
                  {
                    type: 'new-tubes',
                    id: 'recTube1',
                  },
                ],
              },
            },
          },
          {
            type: 'new-competences',
            id: 'recComp1',
            attributes: {
              name: 'Super compétence',
              index: '1.1',
            },
            relationships: {
              thematics: {
                data: [
                  {
                    type: 'new-thematics',
                    id: 'recThem1',
                  },
                ],
              },
            },
          },
          {
            type: 'newAreas',
            id: 'recArea1',
            attributes: {
              title: 'Super domaine',
              color: 'blue',
              code: 'lyoko',
              'framework-id': 'recFrameworkCool1',
            },
            relationships: {
              competences: {
                data: [
                  {
                    type: 'new-competences',
                    id: 'recComp1',
                  },
                ],
              },
            },
          },
        ],
      });
    });

    describe('when target profile id is not found', function () {
      it('should return 404 status code', async function () {
        // given
        sinon
          .stub(usecases, 'getTargetProfileForAdmin')
          .withArgs({ targetProfileId: 666 })
          .rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request('GET', `/api/admin/target-profiles/666`);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
