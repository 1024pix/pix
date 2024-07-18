import { service } from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class CoverRate extends Component {
  @service router;

  get headersByAreas() {
    return ['Code Domaine', 'Domaine', 'Niveau', 'Couverture'];
  }

  get headersByCompetences() {
    return ['Code Domaine', 'Competence', 'Niveau', 'Couverture', 'Moyenne de sujet par competence'];
  }

  get headersByTubes() {
    return ['Code Domaine', 'Competence', 'Sujet', 'Niveau', 'Couverture'];
  }

  get descriptionByAreas() {
    return `**Sens du taux de couverture**:
Indicateur qui rend compte du niveau moyen des utilisateurs  par rapport au niveau maximum qu’ils auraient pu atteindre. Plus ce ratio s’approche des 100 %, plus les utilisateurs ont réussi les épreuves proposées sur ce domaine


**Niveau par domaine** :
Niveau moyen des maximums atteignables par les participants pour les domaines du référentiel de Pix. Cet indicateur va dépendre des parcours qui seront proposés aux participants sur le domaine en question. La configuration des parcours est réalisée avec le partenaire.

**Niveau moyen des utilisateurs par domaine** :
Niveau moyen maximum atteint par le participant sur un domaine. A l’instar de l’indicateur précédent, celui-ci est également lié aux parcours proposés aux participants sur le domaine en question.`;
  }

  get descriptionByCompetences() {
    return `**Sens du taux de couverture**:
Indicateur qui rend compte du niveau moyen des utilisateurs  par rapport au niveau maximum qu’ils auraient pu atteindre. Plus ce ratio s’approche des 100 %, plus les utilisateurs ont réussi les épreuves proposées sur ce domaine



**Niveau par compétence** :
Niveau moyen des maximums atteignables  par les participants pour les compétences du référentiel de Pix. Cet indicateur va dépendre des sujets proposés aux participants à travers les parcours réalisés. La configuration des parcours est réalisée avec le partenaire.

**Niveau par utilisateur** :
Niveau moyen maximum atteint par le participant sur une compétence. A l’instar de l’indicateur précédent, celui-ci est également lié aux parcours proposés aux participants sur le domaine en question.

**Moyenne nombre sujet compétence** :
 Le nombre de sujets moyen rencontré par le participant sur une compétence.

**Moyenne sujets vus par utilisateur par compétence** :
Le nombre de sujets moyen rencontré par le participant sur une compétence.`;
  }

  get descriptionByTubes() {
    return `
**Sens du taux de couverture**:
Indicateur qui rend compte du niveau moyen des utilisateurs  par rapport au niveau maximum qu’ils auraient pu atteindre. Plus ce ratio s’approche des 100 %, plus les utilisateurs ont réussi les épreuves proposées sur ce domaine

**Niveau par sujet**:
Niveau maximum atteignable sur un sujet. La valeur peut être décimale car il s'agit d'une moyenne sur l'ensemble des campagnes paramétrées pour l'organisation. Si le capping est différent entre les campagnes, la valeur pourra être décimale.

**Niveau par utilisateur** :
Niveau moyen obtenu par les utilisateurs sur le sujet. On observe ainsi, en moyenne, à quel niveau s'arrêtent les participants sur ce sujet.`;
  }

  get coverRateByAreas() {
    return this.args.coverRate.byAreas.map((area) => {
      return {
        code_domain: area.code_domaine,
        domain: area.domain,
        coverRateViz: { maxLevel: area.niveau_par_domaine, level: area.niveau_par_utilisateur },
        couverture: `${parseFloat(area.couverture * 100).toFixed(2)} %`,
      };
    });
  }

  get coverRateByCompetences() {
    return this.args.coverRate.byCompetences.map((area) => {
      return {
        competence_code: area.competence_code,
        competence: area.competence,
        coverRateViz: { maxLevel: area.niveau_par_competence, level: area.niveau_par_utilisateur },
        couverture: `${parseFloat(area.couverture * 100).toFixed(2)} %`,
        moyenne_nombre_sujet_par_competence: area.moyenne_nombre_sujet_par_competence,
      };
    });
  }

  get coverRateByTubes() {
    return this.args.coverRate.byTubes
      .map((area) => {
        return {
          competence_code: area.competence_code,
          competence: area.competence,
          sujet: area.sujet,
          coverRateViz: { maxLevel: area.niveau_par_sujet, level: area.niveau_par_user },
          couverture: area.couverture,
        };
      })
      .sort((a, b) => {
        return b.couverture - a.couverture;
      });
  }

  @tracked
  showMoreForTubes = false;

  @tracked
  displayableCoverRateByTubes = this.coverRateByTubes.slice(0, 6);

  @action
  toggleShowMore() {
    this.showMoreForTubes = !this.showMoreForTubes;
    if (this.showMoreForTubes) {
      this.displayableCoverRateByTubes = [...this.coverRateByTubes];
    } else {
      this.displayableCoverRateByTubes = this.coverRateByTubes.slice(0, 6);
    }
  }
}
