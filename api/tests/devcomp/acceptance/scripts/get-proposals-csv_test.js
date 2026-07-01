import { getProposals, getProposalsListAsCsv } from '../../../../src/devcomp/scripts/get-proposals-csv.js';
import { getAnswerableElements } from '../../../../src/devcomp/scripts/utils/get-answerable-elements.js';
import { expect } from '../../../test-helper.js';
import moduleContent from './test-module.json' with { type: 'json' };

describe('Acceptance | Script | Get Proposals as CSV', function () {
  let modulesListAsJs;

  beforeEach(async function () {
    modulesListAsJs = [moduleContent];
  });

  describe('#getProposals', function () {
    let elementsListAsJs;

    beforeEach(async function () {
      elementsListAsJs = getAnswerableElements(modulesListAsJs);
    });

    it('should filter out elements that are not activities', async function () {
      // When
      const proposalsListAsJs = await getProposals(elementsListAsJs);

      // Then
      expect(proposalsListAsJs).to.be.an('array');
      expect(
        proposalsListAsJs.every((proposalElement) =>
          ['qcm', 'qcu', 'qcu-declarative', 'qcu-discovery', 'qrocm'].includes(proposalElement.type),
        ),
      ).to.be.true;
    });

    it('should add some meta info to proposals', async function () {
      // When
      const proposalsListAsJs = await getProposals(elementsListAsJs);

      // Then
      expect(proposalsListAsJs).to.be.an('array');
      expect(proposalsListAsJs.every((proposal) => proposal.isSolution !== undefined)).to.be.true;
      expect(proposalsListAsJs.every((proposal) => proposal.moduleSlug !== undefined)).to.be.true;
      expect(proposalsListAsJs.every((proposal) => proposal.sectionId !== undefined)).to.be.true;
      expect(proposalsListAsJs.every((proposal) => proposal.sectionPosition !== undefined)).to.be.true;
      expect(proposalsListAsJs.every((proposal) => proposal.activityElementPosition !== undefined)).to.be.true;
      expect(proposalsListAsJs.every((proposal) => proposal.grainPosition !== undefined)).to.be.true;
      expect(proposalsListAsJs.every((proposal) => proposal.grainId !== undefined)).to.be.true;
      expect(proposalsListAsJs.every((proposal) => proposal.grainTitle !== undefined)).to.be.true;
    });
  });

  describe('#getProposalsListAsCsv', function () {
    it(`should return proposals list as CSV`, async function () {
      // When
      const proposalsListAsCsv = await getProposalsListAsCsv(modulesListAsJs);

      // Then
      expect(proposalsListAsCsv).to.be.a('string');
      expect(proposalsListAsCsv).to
        .equal(`\ufeff"ProposalModule"\t"ProposalSectionId"\t"ProposalGrainTitle"\t"ProposalGrainId"\t"ProposalSectionPosition"\t"ProposalGrainPosition"\t"ProposalElementId"\t"ProposalElementType"\t"ProposalActivityElementPosition"\t"ProposalElementInstruction"\t"ProposalId"\t"ProposalContent"\t"ProposalIsSolution"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Un fichier à télécharger"\t"b14df125-82d5-4d55-a660-7b34cd9ea1ab"\t1\t3\t"31106aeb-8346-44a6-8ed4-ebaa2106a373"\t"qcu"\t1\t"<p>Quelle type de recette souhaite obtenir l'utilisateur dans l'image&nbsp;?</p>"\t"'1"\t"'Des recettes de lasagne"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Un fichier à télécharger"\t"b14df125-82d5-4d55-a660-7b34cd9ea1ab"\t1\t3\t"31106aeb-8346-44a6-8ed4-ebaa2106a373"\t"qcu"\t1\t"<p>Quelle type de recette souhaite obtenir l'utilisateur dans l'image&nbsp;?</p>"\t"'2"\t"'Des recettes de pâté en croûte"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Un fichier à télécharger"\t"b14df125-82d5-4d55-a660-7b34cd9ea1ab"\t1\t3\t"31106aeb-8346-44a6-8ed4-ebaa2106a373"\t"qcu"\t1\t"<p>Quelle type de recette souhaite obtenir l'utilisateur dans l'image&nbsp;?</p>"\t"'3"\t"'Des recettes végétariennes"\t"=TRUE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Voici un vrai-faux"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t1\t5\t"71de6394-ff88-4de3-8834-a40057a50ff4"\t"qcu"\t2\t"<p>Pix évalue 16 compétences numériques différentes.</p>"\t"'1"\t"'Vrai"\t"=TRUE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Voici un vrai-faux"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t1\t5\t"71de6394-ff88-4de3-8834-a40057a50ff4"\t"qcu"\t2\t"<p>Pix évalue 16 compétences numériques différentes.</p>"\t"'2"\t"'Faux"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Voici un vrai-faux"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t1\t5\t"79dc17f9-142b-4e19-bcbe-bfde4e170d3f"\t"qcu"\t3\t"<p>Pix est découpé en 6 domaines.</p>"\t"'1"\t"'Vrai"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Voici un vrai-faux"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t1\t5\t"79dc17f9-142b-4e19-bcbe-bfde4e170d3f"\t"qcu"\t3\t"<p>Pix est découpé en 6 domaines.</p>"\t"'2"\t"'Faux"\t"=TRUE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Voici un vrai-faux"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t1\t5\t"09dc17f9-142b-4e19-bcbe-bfde4e170d3l"\t"qcu-declarative"\t4\t"<p>Pix est découpé en 6 domaines.</p>"\t"'1"\t"'Vrai"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Voici un vrai-faux"\t"533c69b8-a836-41be-8ffc-8d4636e31224"\t1\t5\t"09dc17f9-142b-4e19-bcbe-bfde4e170d3l"\t"qcu-declarative"\t4\t"<p>Pix est découpé en 6 domaines.</p>"\t"'2"\t"'Faux"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Les 3 piliers de Pix"\t"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"\t1\t6\t"30701e93-1b4d-4da4-b018-fa756c07d53f"\t"qcm"\t5\t"<p>Quels sont les 3 piliers de Pix&#8239;?</p>"\t"'1"\t"'Evaluer ses connaissances et savoir-faire sur 16 compétences du numérique"\t"=TRUE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Les 3 piliers de Pix"\t"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"\t1\t6\t"30701e93-1b4d-4da4-b018-fa756c07d53f"\t"qcm"\t5\t"<p>Quels sont les 3 piliers de Pix&#8239;?</p>"\t"'2"\t"'Développer son savoir-faire sur les jeux de type TPS"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Les 3 piliers de Pix"\t"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"\t1\t6\t"30701e93-1b4d-4da4-b018-fa756c07d53f"\t"qcm"\t5\t"<p>Quels sont les 3 piliers de Pix&#8239;?</p>"\t"'3"\t"'Développer ses compétences numériques"\t"=TRUE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Les 3 piliers de Pix"\t"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"\t1\t6\t"30701e93-1b4d-4da4-b018-fa756c07d53f"\t"qcm"\t5\t"<p>Quels sont les 3 piliers de Pix&#8239;?</p>"\t"'4"\t"'Certifier ses compétences Pix"\t"=TRUE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"Les 3 piliers de Pix"\t"0be0f5eb-4cb6-47c2-b9d3-cb2ceb4cd21c"\t1\t6\t"30701e93-1b4d-4da4-b018-fa756c07d53f"\t"qcm"\t5\t"<p>Quels sont les 3 piliers de Pix&#8239;?</p>"\t"'5"\t"'Evaluer ses compétences de logique et compréhension mathématique"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"test qcu-discovery"\t"cef7d350-008b-410b-8a6a-39b56efdbe8d"\t1\t11\t"0c397035-a940-441f-8936-050db7f997af"\t"qcu-discovery"\t7\t"<p>Quel est le dessert classique idéal lors d’un goûter&nbsp;?</p>"\t"'1"\t"'Des cookies maison tout chauds"\t"=TRUE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"test qcu-discovery"\t"cef7d350-008b-410b-8a6a-39b56efdbe8d"\t1\t11\t"0c397035-a940-441f-8936-050db7f997af"\t"qcu-discovery"\t7\t"<p>Quel est le dessert classique idéal lors d’un goûter&nbsp;?</p>"\t"'2"\t"'Des mini-éclairs au chocolat"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"test qcu-discovery"\t"cef7d350-008b-410b-8a6a-39b56efdbe8d"\t1\t11\t"0c397035-a940-441f-8936-050db7f997af"\t"qcu-discovery"\t7\t"<p>Quel est le dessert classique idéal lors d’un goûter&nbsp;?</p>"\t"'3"\t"'Un plateau de fruits frais et de fromage"\t"=FALSE"
"6282925d-4775-4bca-b513-4c3009ec5886"\t"5bf1c672-3746-4480-b9ac-1f0af9c7c509"\t"test qcu-discovery"\t"cef7d350-008b-410b-8a6a-39b56efdbe8d"\t1\t11\t"0c397035-a940-441f-8936-050db7f997af"\t"qcu-discovery"\t7\t"<p>Quel est le dessert classique idéal lors d’un goûter&nbsp;?</p>"\t"'4"\t"'Une part de gâteau marbré au chocolat et à la vanille"\t"=FALSE"`);
    });
  });
});
