/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLocale, getTranslations } from 'next-intl/server';
import { WcaApiClient } from '../lib/clients/WcaApiClient';
import CompetitionInfoCard from './_components/CompetitionInfoCard';

export default async function Home() {
  const t = await getTranslations('HomePage');
  const locale = await getLocale();

  const wcaApiClient = new WcaApiClient();
  let wcaCompetitions = [];

  try {
    wcaCompetitions = await wcaApiClient.getWcaCompetitionsInThailand(); 
  }
  catch (err) {
    console.log('Failed to fetch WCA competitions:', err);
  }

  return (
    <>
      <div className='text-center'>
        <h1 className='text-4xl font-bold'>{t('heading')}</h1>
        <h2 className='text-3xl font-semibold'>{t('subheading')}</h2>
      </div>
      <div className='mt-12' id='activities'>
       <div>
          <h1 className='text-2xl font-semibold mb-2 text-center'>{t('wca_competitions')}</h1>
          <div className='flex flex-wrap justify-center gap-4 mt-5'>
            {
              wcaCompetitions?.map((competition: any) => (
                <div key={competition.id} className='w-full max-w-100 mx-10'>
                  <CompetitionInfoCard competition={competition}/>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
