'use strict';



module.exports = {

  matchUserAnswerWithActualSolution (answer, solution) {

    if (solution.type === 'QCU') {
      if (answer.attributes.value === solution.value) {
        return 'ok';
      } else {
        return 'ko';
      }
    } else {
      return 'pending';
    }
    
  }

};
