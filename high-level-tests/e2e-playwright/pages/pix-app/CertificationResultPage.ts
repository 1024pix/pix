import type { Page } from '@playwright/test';

import { getDownloadBuffer, getInnerTextOrDefault, normalizeWhitespace } from '../../helpers/utils.ts';

export class CertificationResultPage {
  constructor(public readonly page: Page) {}

  async downloadCertificate() {
    const downloadTrigger = this.page.getByRole('button', { name: 'Télécharger mon certificat' }).click();
    return getDownloadBuffer(this.page, downloadTrigger);
  }

  async getResultInfo() {
    await this.page.getByTestId('pw-candidate-certificate-global-level').waitFor();
    const pixScoreRaw = await getInnerTextOrDefault(this.page.getByTestId('pw-candidate-certificate-pix-score'), null);
    const globalLevelRaw = await Promise.race([
      this.page.getByTestId('pw-candidate-certificate-global-level').innerText(),
      this.page.getByTestId('pw-candidate-certificate-insufficient-global-level').innerText(),
    ]);
    const isCleaObtained = await this.page.getByText('Certification CléA Numérique by Pix').isVisible();
    let hasBadge, badgeSrc;
    try {
      const badgeLocator = this.page.getByTestId('pw-certification-card-badge');
      await badgeLocator.waitFor({ state: 'visible', timeout: 2_000 });
      hasBadge = true;
      badgeSrc = await badgeLocator.getAttribute('src');
    } catch {
      hasBadge = false;
      badgeSrc = null;
    }
    return {
      pixScoreObtained: normalizeWhitespace(pixScoreRaw),
      pixLevelReached: normalizeWhitespace(globalLevelRaw),
      isCleaObtained,
      hasBadge,
      badgeSrc,
    };
  }
}
