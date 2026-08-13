export function extractLatinName(fullName: string): string 
{
    if (!fullName) return '';
    
    // Splits the string at '(' and takes the first half, trimming any leftover spaces
    return fullName.split('(')[0].trim();
}