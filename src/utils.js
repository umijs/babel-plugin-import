export function isRelativePath(nodePath) {
  return /^\.?\.\//.test(nodePath);
}
