function sqrt(a) {
  return Math.sqrt(a);
}
function quadraticRoots(a, b, c) {
  const d = sqrt(b*b - 4*a*c);
  const twoA = 2 * a;
  const x1 = (-b + d) / twoA;
  const x2 = (-b - d) / twoA;
  return [x1, x2];
}
var variableWithEmbeddedKeyword = 0;
let blah = "stuff";
var PI = 3.1415926535;
quadraticRoots(1, 2, 1)
