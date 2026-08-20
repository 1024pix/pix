import type { Page } from '@playwright/test';

import { getNumberValueFromDescriptionList, getStringValueFromDescriptionList } from '../../helpers/utils.ts';

export type EXTERNAL_JURY_LEVELS = 'En attente' | 'Avancé' | 'Expert';

export class CertificationInformationPage {
  constructor(public readonly page: Page) {}

  async getGeneralInfo() {
    await this.page.getByRole('link', { name: 'Informations', exact: true }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+$/);
    return {
      sessionNumber: await getStringValueFromDescriptionList(
        this.page,
        'pw-certification-state-description-list',
        'Session',
      ),
      status: await getStringValueFromDescriptionList(this.page, 'pw-certification-state-description-list', 'Statut'),
      result: await getStringValueFromDescriptionList(this.page, 'pw-certification-state-description-list', 'Résultat'),
    };
  }

  async getDetails() {
    await this.page.getByRole('link', { name: 'Détails', exact: true }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+\/details$/);
    const status = await this.page.getByTestId('pw-certification-general-information-status-tag').innerText();
    return {
      nbAnsweredQuestionsOverTotal: await getStringValueFromDescriptionList(
        this.page,
        'pw-certification-more-information-description-list',
        'Nombre de question répondues / Nombre total de questions',
      ),
      nbQuestionsOK: await getNumberValueFromDescriptionList(
        this.page,
        'pw-certification-more-information-description-list',
        'Nombre de question OK :',
      ),
      nbQuestionsKO: await getNumberValueFromDescriptionList(
        this.page,
        'pw-certification-more-information-description-list',
        'Nombre de question KO :',
      ),
      nbQuestionsAband: await getNumberValueFromDescriptionList(
        this.page,
        'pw-certification-more-information-description-list',
        'Nombre de question abandonnées :',
      ),
      nbValidatedTechnicalIssues: await getNumberValueFromDescriptionList(
        this.page,
        'pw-certification-more-information-description-list',
        'Nombre de problèmes techniques validés :',
      ),
      testEndedBy: await getStringValueFromDescriptionList(
        this.page,
        'pw-certification-general-information-description-list',
        'Certification terminée par :',
        { optional: true },
      ),
      abortReason: await getStringValueFromDescriptionList(
        this.page,
        'pw-certification-general-information-description-list',
        "Motif d'interruption :",
        { optional: true },
      ),
      result: await getStringValueFromDescriptionList(
        this.page,
        'pw-certification-general-information-description-list',
        'Résultat :',
      ),
      status,
    };
  }

  async getCleaResult() {
    return getStringValueFromDescriptionList(
      this.page,
      'pw-certification-information-complementary',
      'CléA Numérique',
      { optional: true },
    );
  }

  async cancelCertification() {
    await this.page.getByRole('link', { name: 'Informations', exact: true }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+$/);
    await this.page.getByRole('button', { name: 'Annuler la certification' }).click();
    await this.page.getByRole('button', { name: 'Confirmer' }).click();

    await this.page.getByText('Désannuler la certification').waitFor({ state: 'visible' });
  }

  async uncancelCertification() {
    await this.page.getByRole('link', { name: 'Informations', exact: true }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+$/);
    await this.page.getByRole('button', { name: 'Désannuler la certification' }).click();
    await this.page.getByRole('button', { name: 'Confirmer' }).click();

    await this.page.getByText('Annuler la certification').waitFor({ state: 'visible' });
  }

  async rejectCertification() {
    await this.page.getByRole('link', { name: 'Informations', exact: true }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+$/);
    await this.page.getByRole('button', { name: 'Rejeter la certification' }).click();
    await this.page.getByRole('button', { name: 'Confirmer' }).click();

    await this.page.getByText('Annuler le rejet').waitFor({ state: 'visible' });
    await this.page
      .getByText(
        'Une situation de fraude a été détectée : après analyse, nous avons statué sur un rejet de la certification.',
      )
      .waitFor({ state: 'visible' });
  }

  async unrejectCertification() {
    await this.page.getByRole('link', { name: 'Informations', exact: true }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+$/);
    await this.page.getByRole('button', { name: 'Annuler le rejet' }).click();
    await this.page.getByRole('button', { name: 'Confirmer' }).click();

    await this.page.getByText('Rejeter la certification').waitFor({ state: 'visible' });
    await this.page
      .getByText(
        'Une situation de fraude a été détectée : après analyse, nous avons statué sur un rejet de la certification.',
      )
      .waitFor({ state: 'detached' });
  }

  async rescoreCertification() {
    await this.page.getByRole('link', { name: 'Informations', exact: true }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+$/);
    await this.page.getByRole('button', { name: 'Re-scorer la certification' }).click();

    await this.page.getByText('La certification a bien été rescorée').waitFor({ state: 'visible' });
  }

  async setExternalJuryResult(externalJuryChoice: EXTERNAL_JURY_LEVELS) {
    await this.page.getByRole('button', { name: 'Modifier le volet jury', exact: true }).click();
    await this.page.getByRole('button', { name: 'Sélectionner un niveau' }).click();
    await this.page.getByRole('option', { name: externalJuryChoice }).click();
    await this.page.getByRole('button', { name: 'Enregistrer' }).click();
    await this.page.getByText('Le résultat du volet jury externe a bien été enregistré').waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Fermer la notification' }).click();
  }
}
