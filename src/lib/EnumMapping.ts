export const EventCodeToFullMap = {
    'E333': '3x3x3 Cube',
    '333': '3x3x3 Cube',
    'E222': '2x2x2 Cube',
    '222': '2x2x2 Cube',
    'E444': '4x4x4 Cube',
    '444': '4x4x4 Cube',
    'E555': '5x5x5 Cube',
    '555': '5x5x5 Cube',
    'E666': '6x6x6 Cube',
    '666': '6x6x6 Cube',
    'E777': '7x7x7 Cube',
    '777': '7x7x7 Cube',
    'E333BF': '3x3x3 Blindfolded',
    '333BF': '3x3x3 Blindfolded',
    'E333FM': '3x3x3 Fewest Moves',
    '333FM': '3x3x3 Fewest Moves',
    'E333OH': '3x3x3 One-Handed',
    '333OH': '3x3x3 One-Handed',
    'CLOCK': 'Clock',
    'MINX': 'Megaminx',
    'PYRAM': 'Pyraminx',
    'SKEWB': 'Skewb',
    'SQ1': 'Square-1',
    'E444BF': '4x4x4 Blindfolded',
    '444BF': '4x4x4 Blindfolded',
    'E555BF': '5x5x5 Blindfolded',
    '555BF': '5x5x5 Blindfolded',
    'E333MBF': '3x3x3 Multi-Blind',
    '333MBF': '3x3x3 Multi-Blind',
    // 'mb': 'Mirror Blocks'
} as const;

export const FormatCodeToFullMap = {
    'BO1': 'Best of 1',
    'BO2': 'Best of 2',
    'BO3': 'Best of 3',
    'MO3': 'Mean of 3',
    'AO5': 'Average of 5',
    'BO5': 'Best of 5',
    'H2H': 'Head to Head',
} as const;

export const EventFullToCodeMap = {
    '3x3x3': '333',
    '3x3x3 Blindfolded': '333bf',
    '3x3x3 One-Handed': '333oh',
    // 'Mirror Blocks': 'mb'
} as const;

export const EventCodeToPrismaMap = {
    '333': 'E333',
    '222': 'E222',
    '444': 'E444',
    '555': 'E555',
    '666': 'E666',
    '777': 'E777',
    '333bf': 'E333BF',
    '333fm': 'E333FM',
    '333oh': 'E333OH',
    'clock': 'CLOCK',
    'minx': 'MINX',
    'pyram': 'PYRAM',
    'skewb': 'SKEWB',
    'sq1': 'SQ1',
    '444bf': 'E444BF',
    '555bf': 'E555BF',
    '333mbf': 'E333MBF'
} as const;