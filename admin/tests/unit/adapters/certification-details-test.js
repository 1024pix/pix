import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | certification details', function (hooks) {
  setupTest(hooks);

  module('#urlForFindRecord', function () {
    test('should build get url from certification details id', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:certification-details');
      const url = adapter.urlForFindRecord(123, 'certification-details');

      // then
      assert.ok(url.endsWith('/admin/certifications/123/details'));
    });
  });

  module('#urlForNeutralizeChallenge', function () {
    test('should build url for challenge neutralization', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:certification-details');
      const url = adapter.urlForNeutralizeChallenge();

      // then
      assert.ok(url.endsWith('/admin/certification/neutralize-challenge'));
    });
  });

  module('#urlForDeneutralizeChallenge', function () {
    test('should build url for challenge deneutralization', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:certification-details');
      const url = adapter.urlForDeneutralizeChallenge();

      // then
      assert.ok(url.endsWith('/admin/certification/deneutralize-challenge'));
    });
  });

  module('#updateRecord', function () {
    test('it should trigger an ajax call to neutralize a challenge', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-details');
      sinon
        .stub(adapter, 'urlForNeutralizeChallenge')
        .returns('https://example.net/api/admin/certification/neutralize-challenge');
      sinon.stub(adapter, 'ajax');
      const store = Symbol();

      // when
      await adapter.updateRecord(
        store,
        { modelName: 'certification-details' },
        {
          id: 123,
          adapterOptions: {
            isNeutralizeChallenge: true,
            certificationCourseId: 1234,
            challengeRecId: 'challengeRecId',
          },
        },
      );

      const expectedPayload = {
        data: {
          data: {
            attributes: {
              certificationCourseId: 1234,
              challengeRecId: 'challengeRecId',
            },
          },
        },
      };

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'https://example.net/api/admin/certification/neutralize-challenge',
          'POST',
          expectedPayload,
        ),
      );
    });
    test('it should trigger an ajax call to deneutralize a challenge', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-details');
      sinon
        .stub(adapter, 'urlForDeneutralizeChallenge')
        .returns('https://example.net/api/admin/certification/deneutralize-challenge');
      sinon.stub(adapter, 'ajax');
      const store = Symbol();

      // when
      await adapter.updateRecord(
        store,
        { modelName: 'certification-details' },
        {
          id: 123,
          adapterOptions: {
            isDeneutralizeChallenge: true,
            certificationCourseId: 1234,
            challengeRecId: 'challengeRecId',
          },
        },
      );

      const expectedPayload = {
        data: {
          data: {
            attributes: {
              certificationCourseId: 1234,
              challengeRecId: 'challengeRecId',
            },
          },
        },
      };

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'https://example.net/api/admin/certification/deneutralize-challenge',
          'POST',
          expectedPayload,
        ),
      );
    });
  });
});
