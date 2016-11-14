/*
 * Compare 2 String.
 * If they contain a list of number, and these unordered number are same, it returns true.
 * Else, it returns false.
 *
 * Example : listA = "1,4,8,3"           listB = "1,4,8,3"         => returns true
 * Example : listA = "1,4,8,3"           listB = "4,8,1,3"         => returns true (even when list are not ordered)
 * Example : listA = "1,4,8,3,55,3"      listB = "4,8,1,3"         => returns false (not same list size)
 * Example : listA = "1,4,8,9"           listB = "4,8,1,3"         => returns false (not same numbers in list)
 * Example : listA = "blah-blah"         listB = "4,8,1,3"         => returns false (listA is not a list)
 */
function areStringListEquivalent(listA, listB) {
  let result = false;
  try {
    result = (listA.split(',').sort().join(',') === listB.split(',').sort().join(','));
  } catch (e) {
    result = false;
  }
  return result;
}

module.exports = {

  match (answer, solution) {

    if (areStringListEquivalent(answer, solution)) {
      return 'ok';
    }
    return 'ko';
  }

};
