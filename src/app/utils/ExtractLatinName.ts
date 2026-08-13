export function extractLatinName(fullName: string): string {
  if (!fullName) 
    return '';
  
  return fullName.split('(')[0].trim();
}