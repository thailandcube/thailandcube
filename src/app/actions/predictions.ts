/* eslint-disable @typescript-eslint/no-explicit-any */
import { CuberData } from '@/model/predictions/CuberData';

export async function getAllCubers({ competitionId, isThaiOnly = false }: { competitionId: string, isThaiOnly: boolean }) 
{
    console.log('Received competitionId', competitionId);

    try
    {
        const eventIds: string[] = [];

        await fetch(`${process.env.WCA_URL}/api/v0/competitions/${competitionId}/events`, 
            {
                method: 'GET'
            }
        )
        .then(response =>
        {
            if (!response.ok)
                throw new Error('Competition event fetching response was not ok');

            return response.json();
        })
        .then(data => 
        {
            console.log('Received event data:', data);

            for (const eventData of data) 
                eventIds.push(eventData.id);
        })

        const cubersData: Record<string, CuberData[]> = {};

        for (const eventId of eventIds)
        {
            const response = await fetch(`${process.env.WCA_URL}/api/v0/competitions/${competitionId}/psych-sheet/${eventId}`);

            if (!response.ok)
                throw new Error(`An error occured while fetching ${eventId}'s psych sheet`);

            const eventPsych = await response.json();
            
            const allRegisteredCubers: CuberData[] = eventPsych.sorted_rankings.map((entry: any) => ({
                name: entry.name,
                wcaId: entry.wca_id,
                countryIso2: entry.country_iso2,
                event: eventId,
                pos: entry.pos,
            }));

            let cubers: CuberData[];

            if (isThaiOnly)
                cubers = allRegisteredCubers.filter(cuber => cuber.countryIso2 === 'TH');
            else 
                cubers = allRegisteredCubers;

            cubers.sort((a, b) => 
            {
                // If both don't have a position, keep their current order
                if (a.pos === null && b.pos === null) return 0;
                
                // If only 'a' is missing a position, push 'a' to the bottom
                if (a.pos === null) return 1;
                
                // If only 'b' is missing a position, push 'b' to the bottom
                if (b.pos === null) return -1;
                
                // If both have valid numeric positions, sort ascending normally
                return a.pos - b.pos;
            });

            cubersData[eventId] = cubers;
        }

        return cubersData;
    }
    catch (err)
    {
        console.error(err);
    }
    
    return;
}