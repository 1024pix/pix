# Nommage CSS

Privilégier le plus possible la [Convention Block__Element--Modifier BEM](http://getbem.com/).

Quand on reprend l'élément pour devenir un block, il n'est pas obligatoire de reprendre l'élément parent. 

Par exemple, avec le parent `profilv2-header__hexagon-score`, l'enfant doit devenir `hexagon-score__content`. On n'est pas obligé de l'appeler `profilv2-header-hexagon-score__content`. 

Selon BEM, les classes ne doivent pas refléter la structure arborescente du DOM, et être le plus flat possible. Puisque par définition d'un block, tout ce qui est de la forme block__element-n est un tout indivisible.
