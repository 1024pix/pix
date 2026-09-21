import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-admin/config/environment';

const AREAS = [
  {
    code: '1',
    label: '1 — Informations et données',
    competences: [
      { code: '1.1', label: '1.1' },
      { code: '1.2', label: '1.2' },
      { code: '1.3', label: '1.3' },
    ],
  },
  {
    code: '2',
    label: '2 — Communication et collaboration',
    competences: [
      { code: '2.1', label: '2.1' },
      { code: '2.2', label: '2.2' },
      { code: '2.3', label: '2.3' },
      { code: '2.4', label: '2.4' },
    ],
  },
  {
    code: '3',
    label: '3 — Création de contenu',
    competences: [
      { code: '3.1', label: '3.1' },
      { code: '3.2', label: '3.2' },
      { code: '3.3', label: '3.3' },
      { code: '3.4', label: '3.4' },
    ],
  },
  {
    code: '4',
    label: '4 — Protection et sécurité',
    competences: [
      { code: '4.1', label: '4.1' },
      { code: '4.2', label: '4.2' },
      { code: '4.3', label: '4.3' },
    ],
  },
  {
    code: '5',
    label: '5 — Environnement numérique',
    competences: [
      { code: '5.1', label: '5.1' },
      { code: '5.2', label: '5.2' },
    ],
  },
];

const ALL_COMPETENCES = AREAS.flatMap((a) => a.competences);

const LOCALE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

export default class CertificateGenerator extends Component {
  @service session;

  @tracked pixScore = '500';
  @tracked locale = 'fr';
  @tracked isLoading = false;
  @tracked error = null;
  @tracked competenceLevels = Object.fromEntries(ALL_COMPETENCES.map((c) => [c.code, '3']));

  get localeOptions() {
    return LOCALE_OPTIONS;
  }

  // Pré-mappe les valeurs dans les objets pour éviter le helper `get`
  // (qui interprète "1.1" comme un chemin imbriqué Ember, pas une clé directe)
  get competenceGroups() {
    return AREAS.map((area) => ({
      ...area,
      competences: area.competences.map((comp) => ({
        ...comp,
        value: this.competenceLevels[comp.code],
      })),
    }));
  }

  @action
  updatePixScore(event) {
    this.pixScore = event.target.value;
  }

  @action
  updateLocale(value) {
    this.locale = value;
  }

  @action
  updateCompetenceLevel(code, event) {
    this.competenceLevels = { ...this.competenceLevels, [code]: event.target.value };
  }

  @action
  async generatePreview() {
    this.isLoading = true;
    this.error = null;

    try {
      const competences = ALL_COMPETENCES.map((c) => ({
        code: c.code,
        level: parseInt(this.competenceLevels[c.code] ?? '0', 10),
      }));
      const token = this.session.data.authenticated.access_token;

      const response = await fetch(`${ENV.APP.API_HOST}/api/admin/tools/certificate-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locale: this.locale,
          pixScore: parseInt(this.pixScore, 10),
          competences,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.error = `Erreur ${response.status}: ${body || response.statusText}`;
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificate-preview.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      this.error = e.message;
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Générateur de certificat (prévisualisation)</h2>
      </header>

      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 700px;">
        <div style="display: flex; gap: 16px; align-items: flex-end;">
          <PixInput
            @id="pix-score"
            @value={{this.pixScore}}
            type="number"
            min="0"
            max="896"
            {{on "input" this.updatePixScore}}
          >
            <:label>Score Pix (0–896)</:label>
          </PixInput>

          <PixSelect
            @id="locale"
            @options={{this.localeOptions}}
            @value={{this.locale}}
            @onChange={{this.updateLocale}}
          >
            <:label>Langue</:label>
          </PixSelect>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <p style="font-weight: bold; margin: 0;">Niveaux par compétence (0–8)</p>

          {{#each this.competenceGroups as |area|}}
            <div>
              <p style="font-size: 13px; color: #5e6c84; margin: 0 0 6px;">{{area.label}}</p>
              <div style="display: grid; grid-template-columns: repeat(4, 80px); gap: 8px;">
                {{#each area.competences as |comp|}}
                  <PixInput
                    @id={{comp.code}}
                    @value={{comp.value}}
                    type="number"
                    min="0"
                    max="8"
                    {{on "input" (fn this.updateCompetenceLevel comp.code)}}
                  >
                    <:label>{{comp.label}}</:label>
                  </PixInput>
                {{/each}}
              </div>
            </div>
          {{/each}}
        </div>

        {{#if this.error}}
          <p style="color: red; margin: 0;">{{this.error}}</p>
        {{/if}}

        <div>
          <PixButton @triggerAction={{this.generatePreview}} @isLoading={{this.isLoading}}>
            Télécharger le PDF
          </PixButton>
        </div>
      </div>
    </section>
  </template>
}
