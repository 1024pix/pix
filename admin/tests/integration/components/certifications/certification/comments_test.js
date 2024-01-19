import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | certification | Comments ', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display certification comments', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.certification = store.createRecord('certification', {
      firstName: 'Fabrice',
      lastName: 'Gadjo',
      birthdate: '2000-12-15',
      sex: 'F',
      birthInseeCode: '99101',
      birthplace: 'Copenhague',
      birthCountry: 'DANEMARK',
      commentByJury: "C'était super, le jury est content",
      commentForOrganization: "C'était super, bravo à l'organisation",
      commentForCandidate: "C'était super, bravo au candidat",
    });

    // when
    const screen = await render(hbs`<Certifications::Certification::Comments @certification={{this.certification}} />`);

    // then
    assert.dom(screen.getByText('Pour le candidat :')).exists();
    assert.dom(screen.getByText("C'était super, bravo au candidat")).exists();
    assert.dom(screen.getByText("Pour l'organisation :")).exists();
    assert.dom(screen.getByText("C'était super, bravo à l'organisation")).exists();
    assert.dom(screen.getByText('Notes internes Jury Pix :')).exists();
    assert.dom(screen.getByText("C'était super, le jury est content")).exists();
  });
});
