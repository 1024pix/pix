import { fileURLToPath } from 'node:url';

import moduleDatasource from '../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import { getCsvContent } from '../../src/shared/infrastructure/utils/csv/write-csv-utils.js';
import { getAnswerableElements } from './get-answerable-elements-csv.js';

export async function getProposalsListAsCsv(modules) {
  const elements = getAnswerableElements(modules);
  const proposals = getProposals(elements);

  return await getCsvContent({
    data: proposals,
    delimiter: '\t',
    fileHeaders: [
      { label: 'ProposalElementId', value: 'id' },
      { label: 'ProposalElementType', value: 'type' },
      { label: 'ProposalActivityElementPosition', value: (row) => row.activityElementPosition + 1 },
      { label: 'ProposalElementInstruction', value: 'instruction' },
      { label: 'ProposalId', value: (row) => `'${row.proposal.id}` },
      { label: 'ProposalContent', value: (row) => `'${row.proposal.content}` },
      {
        label: 'ProposalIsSolution',
        value: (row) => (row.isSolution ? '=TRUE' : '=FALSE'),
      },
      { label: 'ProposalGrainPosition', value: (row) => row.grainPosition + 1 },
      { label: 'ProposalGrainId', value: 'grainId' },
      { label: 'ProposalGrainTitle', value: 'grainTitle' },
      { label: 'ProposalModuleSlug', value: 'moduleSlug' },
    ],
  });
}

// Only run the following if the file is called directly
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url);

  if (process.argv[1] === modulePath) {
    const modules = await moduleDatasource.list();
    console.log(await getProposalsListAsCsv(modules));
  }
}

export function getProposals(elements) {
  const proposals = elements
    .filter((element) => {
      switch (element.type) {
        case 'qcu':
        case 'qcm':
          return true;
        case 'qrocm':
          return element.proposals.some((proposal) => proposal.type === 'select');
      }
      return false;
    })
    .map((element) => {
      if (element.type === 'qrocm') {
        const selects = element.proposals.filter((proposal) => proposal.type === 'select');
        element.proposals = selects.flatMap((select) =>
          select.options.map((option) => ({ ...option, isSolution: select.solutions.includes(option.id) })),
        );
      }
      return element;
    })
    .flatMap((element) => element.proposals.map((proposal) => ({ proposal, ...element })))
    .map((element) => ({
      ...element,
      isSolution: isSolution(element),
    }));

  return proposals;
}

function isSolution(row) {
  switch (row.type) {
    case 'qcu':
      return row.solution === row.proposal.id;
    case 'qcm':
      return row.solutions.includes(row.proposal.id);
    case 'qrocm':
      return row.proposal.isSolution;
  }
}
