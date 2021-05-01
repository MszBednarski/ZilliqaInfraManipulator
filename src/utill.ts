export function getParentDir() {
  if (require.main) return require.main.path;
  throw new Error("require main not defined");
}
