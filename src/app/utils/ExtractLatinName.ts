export function extractLatinName(fullName: string): string {
  if (!fullName) 
    return '';

  if (fullName.includes('DNF'))
    return fullName;
  
  return fullName.split('(')[0].trim();
}