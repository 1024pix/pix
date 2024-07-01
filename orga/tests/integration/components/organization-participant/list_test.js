import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization');

    class CurrentUserStub extends Service {
      organization = organization;
    }

    this.owner.register('service:current-user', CurrentUserStub);
    this.set('noop', sinon.stub());
  });

  test('it should display the header labels', async function (assert) {
    // given
    this.set('participants', []);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);
    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.ok(screen.getByRole('columnheader', { name: 'Nom' }));
    assert.ok(screen.getByRole('columnheader', { name: 'Prénom' }));
    assert.ok(screen.getByRole('columnheader', { name: 'Nombre de participations' }));
    assert.ok(screen.getByRole('columnheader', { name: 'Dernière participation' }));
  });

  test('it should have a caption to describe the table ', async function (assert) {
    // given
    this.set('participants', [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
      },
    ]);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.ok(screen.getByRole('table', { name: this.intl.t('pages.organization-participants.table.description') }));
  });

  test('it should display a list of participants', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
      },
      {
        lastName: "L'asticot",
        firstName: 'Gogo',
        id: 56,
      },
    ];
    this.set('participants', participants);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);
    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.ok(screen.getByRole('cell', { name: 'La Terreur' }));
    assert.ok(screen.getByRole('cell', { name: "L'asticot" }));
  });

  test('it should display a link to access participant detail', async function (assert) {
    // given
    this.owner.setupRouter();

    const participants = [
      {
        lastName: 'Chase',
        firstName: 'PatPatrouille',
        id: 34,
      },
      {
        lastName: 'Ruben',
        firstName: 'PatPatrouille',
        id: 56,
      },
    ];
    this.set('participants', participants);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );
    // then
    assert.dom(screen.getByRole('link', { name: 'Ruben' })).hasProperty('href', /\/participants\/56/g);
  });

  test('it should display the participant firstName and lastName', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
      },
    ];

    this.set('participants', participants);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.ok(screen.getByRole('cell', { name: 'La Terreur' }));
    assert.ok(screen.getByRole('cell', { name: 'Gigi' }));
  });

  test('it should display the number of participations for each participant', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
        participationCount: 4,
      },
      {
        lastName: "L'asticot",
        firstName: 'Gogo',
        id: 56,
        participationCount: 1,
      },
    ];

    this.set('participants', participants);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );
    const allRows = screen.getAllByLabelText(this.intl.t('pages.organization-participants.table.row-title'));

    // then
    assert.dom(allRows[0]).containsText(4);
    assert.dom(allRows[1]).containsText(1);
  });

  test('it should display the date of the last participation and the tooltip informations for each participant', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
        lastParticipationDate: new Date('2022-05-15'),
      },
      {
        lastName: "L'asticot",
        firstName: 'Gogo',
        id: 56,
        lastParticipationDate: new Date('2022-01-07'),
      },
    ];

    this.set('participants', participants);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );
    const allRows = screen.getAllByLabelText(this.intl.t('pages.organization-participants.table.row-title'));

    // then
    assert.dom(allRows[0]).containsText('15/05/2022');
    assert.dom(allRows[1]).containsText('07/01/2022');
    assert.strictEqual(
      screen.getAllByLabelText(
        this.intl.t('pages.participants-list.latest-participation-information-tooltip.aria-label'),
      ).length,
      2,
    );
  });

  test('it should display participant as eligible for certification when the participant is certifiable and the certifiableAt', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
        lastParticipationDate: new Date('2022-05-15'),
        isCertifiable: true,
        certifiableAt: new Date('2022-01-02'),
      },
    ];

    this.set('participants', participants);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.ok(
      screen.getByRole('cell', {
        name: `${this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible')} 02/01/2022`,
      }),
    );
  });

  module('filtering cases', function () {
    test('it should display the filter labels', async function (assert) {
      // given
      this.set('participants', []);
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      // when
      const screen = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      // then
      assert.ok(screen.getByLabelText('Recherche sur le nom et prénom'));
    });

    test('it should trigger filtering with fullName search', async function (assert) {
      // given
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
        },
      ];

      this.set('participants', participants);
      this.triggerFiltering = sinon.stub();
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      // when
      await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );
      await fillByLabel('Recherche sur le nom et prénom', 'Karam');
      // then
      sinon.assert.calledWith(this.triggerFiltering, 'fullName', 'Karam');
      assert.ok(true);
    });

    test('it should trigger filtering with certificability', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
        },
      ];

      this.set('participants', participants);
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      const { getByLabelText, findByRole } = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      // when
      const select = await getByLabelText(
        this.intl.t('pages.organization-participants.filters.type.certificability.label'),
      );
      await click(select);
      await findByRole('menu');
      await clickByName(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'certificability', ['eligible']);
      assert.ok(true);
    });
  });

  module('when user is sorting the table', function () {
    module('sort by participation count', function () {
      test('it should trigger ascending sort on participation count column', async function (assert) {
        // given
        this.set('participationCountOrder', null);

        const sortByParticipationCount = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByParticipationCount', sortByParticipationCount);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByParticipationCount, 'asc');
        assert.ok(true);
      });

      test('it should trigger ascending sort on participation count column when it is already sort descending', async function (assert) {
        // given
        this.set('participationCountOrder', 'desc');

        const sortByParticipationCount = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByParticipationCount', sortByParticipationCount);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.participation-count.ariaLabelSortDown'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByParticipationCount, 'asc');
        assert.ok(true);
      });

      test('it should trigger descending sort on participation count column when it is already sort ascending', async function (assert) {
        // given
        this.set('participationCountOrder', 'asc');

        const sortByParticipationCount = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByParticipationCount', sortByParticipationCount);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.participation-count.ariaLabelSortUp'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByParticipationCount, 'desc');
        assert.ok(true);
      });
    });

    module('sort by lastname', function () {
      test('it should trigger ascending sort on lastname column', async function (assert) {
        // given

        this.set('lastnameSort', null);

        const sortByLastname = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByLastname', sortByLastname);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.last-name.ariaLabelDefaultSort'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLastname, 'asc');
        assert.ok(true);
      });

      test('it should trigger ascending sort on lastname column when it is already sort descending', async function (assert) {
        // given
        this.set('lastnameSort', 'desc');

        const sortByLastname = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByLastname', sortByLastname);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.last-name.ariaLabelSortDown'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLastname, 'asc');
        assert.ok(true);
      });

      test('it should trigger descending sort on lastname column when it is already sort ascending', async function (assert) {
        // given
        this.set('lastnameSort', 'asc');

        const sortByLastname = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByLastname', sortByLastname);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(this.intl.t('pages.organization-participants.table.column.last-name.ariaLabelSortUp')),
        );

        // then
        sinon.assert.calledWithExactly(sortByLastname, 'desc');
        assert.ok(true);
      });
    });

    module('sort by latestParticipation', function () {
      test('it should trigger ascending sort on latestParticipation column', async function (assert) {
        // given

        this.set('latestParticipationOrder', null);

        const sortByLatestParticipation = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByLatestParticipation', sortByLatestParticipation);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @latestParticipationOrder={{this.latestParticipationOrder}}
  @sortByLatestParticipation={{this.sortByLatestParticipation}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.latest-participation.ariaLabelDefaultSort'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLatestParticipation, 'asc');
        assert.ok(true);
      });

      test('it should trigger ascending sort on latestParticipation column when it is already sort descending', async function (assert) {
        // given
        this.set('latestParticipationOrder', 'desc');

        const sortByLatestParticipation = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByLatestParticipation', sortByLatestParticipation);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @latestParticipationOrder={{this.latestParticipationOrder}}
  @sortByLatestParticipation={{this.sortByLatestParticipation}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.latest-participation.ariaLabelSortDown'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLatestParticipation, 'asc');
        assert.ok(true);
      });

      test('it should trigger descending sort on latestParticipation column when it is already sort ascending', async function (assert) {
        // given
        this.set('latestParticipationOrder', 'asc');

        const sortByLatestParticipation = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        this.set('participants', participants);
        this.set('sortByLatestParticipation', sortByLatestParticipation);
        this.set('certificabilityFilter', []);
        this.set('fullNameFilter', null);

        const screen = await render(
          hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.noop}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @latestParticipationOrder={{this.latestParticipationOrder}}
  @sortByLatestParticipation={{this.sortByLatestParticipation}}
/>`,
        );

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.organization-participants.table.column.latest-participation.ariaLabelSortUp'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLatestParticipation, 'desc');
        assert.ok(true);
      });
    });
  });

  test('it should display the empty state when no participants', async function (assert) {
    // given
    const participants = [];
    this.set('participants', participants);
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    this.triggerFiltering = sinon.stub();

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.ok(screen.getByText(this.intl.t('pages.organization-participants.table.empty')));
  });

  test('it should display the certificability tooltip', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        isCertifiable: true,
      },
    ];

    this.set('participants', participants);
    this.triggerFiltering = sinon.stub();
    this.set('certificabilityFilter', []);
    this.set('fullNameFilter', null);

    // when
    const screen = await render(
      hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    await click(screen.getByLabelText(this.intl.t('components.certificability-tooltip.aria-label')));

    // then
    assert.ok(
      await screen.findByRole('tooltip', {
        name: new RegExp(this.intl.t('components.certificability-tooltip.content')),
      }),
    );
  });

  module('when user is admin of organisation', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      this.triggerFiltering = sinon.stub();
      this.set('fullNameFilter', null);
      this.set('certificabilityFilter', []);
    });

    test('it should display checkboxes', async function (assert) {
      //given
      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];
      this.set('participants', participants);

      //when
      const screen = await render(hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @deleteParticipants={{this.deleteParticipants}}
/>`);

      const mainCheckbox = screen.getByRole('checkbox', {
        name: this.intl.t('pages.organization-participants.table.column.mainCheckbox'),
      });
      const learnerCheckbox = screen.getByRole('checkbox', {
        name: this.intl.t('pages.organization-participants.table.column.checkbox', {
          firstname: participants[0].firstName,
          lastname: participants[0].lastName,
        }),
      });

      //then
      assert.ok(mainCheckbox);
      assert.ok(learnerCheckbox);
    });

    test('it should disable the main checkbox when participants list is empty', async function (assert) {
      //given
      const participants = [];

      this.set('participants', participants);
      this.deleteParticipants = sinon.stub();

      //when
      const screen = await render(hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @certificabilityFilter={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @deleteParticipants={{this.deleteParticipants}}
/>`);

      //then
      assert.ok(
        screen
          .getByRole('checkbox', {
            name: this.intl.t('pages.organization-participants.table.column.mainCheckbox'),
          })
          .hasAttribute('disabled'),
      );
    });

    test('it should reset selected participants when using pagination', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const participants = [
        { id: '1', firstName: 'Spider', lastName: 'Man' },
        { id: '2', firstName: 'Captain', lastName: 'America' },
      ];

      participants.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };

      this.set('participants', participants);
      this.triggerFiltering = sinon.stub();
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      // when
      const screen = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];
      const secondLearnerSelected = screen.getAllByRole('checkbox')[2];

      await click(firstLearnerSelected);
      await click(secondLearnerSelected);

      const pagination = await screen.findByLabelText(this.intl.t('common.pagination.action.next'));
      await click(pagination);
      assert.false(firstLearnerSelected.checked);
      assert.false(secondLearnerSelected.checked);
    });

    test('it should reset selected participant when using filters', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

      participants.meta = { page: 1, pageSize: 10, rowCount: 50, pageCount: 5 };

      this.set('participants', participants);
      this.triggerFiltering = sinon.stub();
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      // when
      const screen = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];

      await click(firstLearnerSelected);

      await fillByLabel('Recherche sur le nom et prénom', 'Something');

      assert.false(firstLearnerSelected.checked);
    });

    test('it should reset selected participant when reset filters', async function (assert) {
      // given
      const resetFilter = sinon.spy();
      this.set('resetFilter', resetFilter);
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
        },
      ];

      this.set('participants', participants);
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', 'La Terreur');

      const screen = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @onResetFilter={{this.resetFilter}}
  @triggerFiltering={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];

      await click(firstLearnerSelected);

      // when
      const resetButton = await screen.findByRole('button', {
        name: this.intl.t('common.filters.actions.clear'),
      });
      await click(resetButton);

      // then
      assert.false(firstLearnerSelected.checked);
    });

    test('it should reset selected participant when using sort', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

      participants.meta = { page: 1, pageSize: 10, rowCount: 50, pageCount: 5 };

      this.set('participants', participants);
      this.triggerFiltering = sinon.stub();
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      // when
      const screen = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @sortByParticipationCount={{this.noop}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];

      await click(firstLearnerSelected);

      const sortButton = await screen.findByLabelText(
        this.intl.t('pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
      );
      await click(sortButton);

      assert.false(firstLearnerSelected.checked);
    });

    module('action bar', function () {
      test('it display action bar', async function (assert) {
        //given
        const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

        this.set('participants', participants);
        this.deleteParticipants = sinon.stub();

        //when
        const screen = await render(hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @deleteParticipants={{this.deleteParticipants}}
/>`);

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[1];
        await click(firstLearnerToDelete);

        //then
        assert.ok(
          screen.getByText(this.intl.t('pages.organization-participants.action-bar.information', { count: 1 })),
        );
      });

      test('it should open the deletion modale', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const participants = [spiderLearner, peterLearner, milesLearner];

        this.set('participants', participants);
        this.deleteParticipants = sinon.stub();

        //when
        const screen = await render(hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @deleteParticipants={{this.deleteParticipants}}
/>`);

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: this.intl.t('pages.organization-participants.action-bar.delete-button'),
        });

        await click(deleteButton);

        await screen.findByRole('dialog');

        const confirmationButton = await screen.findByRole('button', {
          name: this.intl.t('pages.organization-participants.deletion-modal.delete-button'),
        });

        //then
        assert.ok(confirmationButton);
      });

      test('it should delete participants', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const participants = [spiderLearner, peterLearner, milesLearner];

        this.set('participants', participants);
        this.deleteParticipants = sinon.stub();

        //when
        const screen = await render(hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @deleteParticipants={{this.deleteParticipants}}
/>`);

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: this.intl.t('pages.organization-participants.action-bar.delete-button'),
        });

        await click(deleteButton);

        await screen.findByRole('dialog');

        const allowMultipleDeletionCheckbox = await screen.findByRole('checkbox', {
          name: this.intl.t('pages.organization-participants.deletion-modal.confirmation-checkbox', { count: 2 }),
        });

        await click(allowMultipleDeletionCheckbox);

        const confirmationButton = await screen.findByRole('button', {
          name: this.intl.t('pages.organization-participants.deletion-modal.delete-button'),
        });
        await click(confirmationButton);

        //then
        sinon.assert.calledWith(this.deleteParticipants, [peterLearner, milesLearner]);
        assert.ok(true);
      });

      test('it should reset selected participants after deletion', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const participants = [spiderLearner, peterLearner, milesLearner];

        this.set('participants', participants);
        this.deleteParticipants = sinon.stub();

        //when
        const screen = await render(hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @deleteParticipants={{this.deleteParticipants}}
/>`);
        const mainCheckbox = screen.getAllByRole('checkbox')[0];
        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: this.intl.t('pages.organization-participants.action-bar.delete-button'),
        });

        await click(deleteButton);

        const allowMultipleDeletionCheckbox = await screen.findByRole('checkbox', {
          name: this.intl.t('pages.organization-participants.deletion-modal.confirmation-checkbox', { count: 2 }),
        });

        await click(allowMultipleDeletionCheckbox);

        const confirmationButton = await screen.findByRole('button', {
          name: this.intl.t('pages.organization-participants.deletion-modal.delete-button'),
        });
        await click(confirmationButton);

        //then
        assert.false(mainCheckbox.checked);
      });
    });
  });

  module('hide checkbox context', function () {
    test('when user is not admin of organisation', async function (assert) {
      //given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];
      this.set('participants', participants);
      this.triggerFiltering = sinon.stub();
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      //when
      const screen = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );
      const checkboxes = screen.queryAllByRole('checkbox');

      //then
      assert.deepEqual(checkboxes.length, 0);
    });

    test('when feature import is enabled of organisation', async function (assert) {
      //given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        hasLearnerImportFeature = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];
      this.set('participants', participants);
      this.triggerFiltering = sinon.stub();
      this.set('certificabilityFilter', []);
      this.set('fullNameFilter', null);

      //when
      const screen = await render(
        hbs`<OrganizationParticipant::List
  @participants={{this.participants}}
  @triggerFiltering={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @fullName={{this.fullNameFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );
      const checkboxes = screen.queryAllByRole('checkbox');

      //then
      assert.deepEqual(checkboxes.length, 0);
    });
  });
});
