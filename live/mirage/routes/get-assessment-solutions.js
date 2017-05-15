import refSolution from '../data/solutions/ref-solution';
import refQcuSolution from '../data/solutions/ref-qcu-solution';

export default function(schema, request) {

  return (request.params.answerId === 'ref_answer_qcu_id') ? refQcuSolution : refSolution;

}
