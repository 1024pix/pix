import { service } from '@ember/service';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

export default class CoverRate extends Component {
  @service router;

  get headersByAreas() {
    return Object.keys(this.args.coverRate.byAreas[0]);
  }

  get headersByCompetences() {
    return Object.keys(this.args.coverRate.byCompetences[0]);
  }

  get headersByTubes() {
    return Object.keys(this.args.coverRate.byTubes[0]);
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

  chartOptions = {
    indexAxis: 'y',
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  get chartDataByAreas() {
    const data = this.args.coverRate.byAreas.map((area) => {
      return {
        y: `${area.code_domaine}. ${area.domain}`,
        x: area.couverture * 100,
      };
    });

    return {
      datasets: [{ label: 'Taux de couverture', data }],
    };
  }

  get chartDataByCompetences() {
    const data = this.args.coverRate.byCompetences.map((area) => {
      return {
        y: `${area.competence_code}. ${area.competence}`,
        x: area.couverture * 100,
      };
    });
    return {
      datasets: [{ label: 'Taux de couverture', data }],
    };
  }

  get chartDataByTubes() {
    const data = this.args.coverRate.byTubes.map((area) => {
      return {
        competence: area.competence_code,
        y: `${area.competence_code}. ${area.sujet}`,
        x: area.couverture * 100,
      };
    });

    const sortedData = data.sort((a, b) => {
      return a.y.localeCompare(b.y);
    });

    return {
      datasets: [{ label: 'Taux de couverture', data: sortedData }],
    };
  }

  @tracked
  currentPage = this.router.currentRoute.queryParams.pageNumber;

  get pagination() {
    const ROWS_PER_PAGE = 10;
    return {
      page: Number(this.currentPage),
      pageSize: ROWS_PER_PAGE,
      pageCount: Math.ceil(this.args.coverRate.byTubes.length / ROWS_PER_PAGE),
      rowCount: this.args.coverRate.byTubes.length,
    };
  }
}
