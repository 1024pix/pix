class Appel {
  constructor({ rang, ligneSource, nom, args }) {
    this.rang = rang;
    this.ligneSource = ligneSource;
    this.nom = nom;
    this.args = args;
    this.verdict = null;
    this.resultat = null;
  }

  simuler(resultat) {
    this.resultat = resultat;
    this.verdict = resultat.error !== undefined ? 'erreur' : 'pret';
  }

  marquerDoublon() {
    this.verdict = 'doublon';
  }

  exclure() {
    this.verdict = 'exclue';
  }

  executer(resultat) {
    this.resultat = resultat;
  }
}

export default class Lot {
  constructor() {
    this.appels = [];
    this.etat = 'a_simuler';
    this.document = null;
  }

  ajouterAppel({ ligneSource, nom, args }) {
    if (this.etat !== 'a_simuler') {
      throw new Error('ajouterAppel interdit : lot pas en état a_simuler');
    }
    const rang = this.appels.length + 1;
    const appel = new Appel({ rang, ligneSource, nom, args });
    this.appels.push(appel);
  }

  enregistrerResultatSimulation(rang, resultat) {
    const appel = this.appels.find((a) => a.rang === rang);
    appel.simuler(resultat);

    // Detect external ID duplicates across all appels that have a verdict
    const byExternalId = new Map();
    for (const a of this.appels) {
      if (a.args.externalId == null) continue;
      const id = a.args.externalId;
      if (!byExternalId.has(id)) {
        byExternalId.set(id, []);
      }
      byExternalId.get(id).push(a);
    }

    for (const group of byExternalId.values()) {
      if (group.length > 1) {
        for (const a of group) {
          a.marquerDoublon();
        }
      }
    }
  }

  terminerSimulation() {
    const incomplete = this.appels.some((a) => a.verdict === null);
    if (incomplete) {
      throw new Error('simulation-incomplete : tous les appels doivent avoir un verdict');
    }
    this.etat = 'simule';
  }

  approuver() {
    const hasBlockingIssue = this.appels.some(
      (a) => (a.verdict === 'erreur' || a.verdict === 'doublon'),
    );
    if (hasBlockingIssue) {
      throw new Error('lot-a-des-erreurs-non-exclues');
    }
    this.etat = 'approuve';
  }

  appelsAExecuter() {
    if (this.etat !== 'approuve' && this.etat !== 'en_cours') {
      throw new Error('appelsAExecuter interdit : lot pas en état approuve ou en_cours');
    }
    return this.appels.filter((a) => a.verdict === 'pret');
  }

  demarrerExecution() {
    this.etat = 'en_cours';
  }

  enregistrerResultatExecution(rang, resultat) {
    const appel = this.appels.find((a) => a.rang === rang);
    // Do not overwrite if already executed (has an id result)
    if (appel.resultat && appel.resultat.id !== undefined) {
      return;
    }
    appel.executer(resultat);

    // Check if all pret appels are now executed
    const pretAppels = this.appels.filter((a) => a.verdict === 'pret');
    const allDone = pretAppels.every((a) => a.resultat && a.resultat.id !== undefined);
    if (allDone && pretAppels.length > 0) {
      this.etat = 'termine';
    }
  }

  arreter() {
    this.etat = 'termine';
  }
}
