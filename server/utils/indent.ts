export const detectIndentation = (jsonString: string): string | number => {
  const lines = jsonString.split('\n');
  if (lines.length < 2) return 2;

  const secondLine = lines[1];
  if (secondLine.startsWith('\t')) return '\t';

  const spaces = secondLine.match(/^ +/);
  return spaces ? spaces[0].length : 2;
};