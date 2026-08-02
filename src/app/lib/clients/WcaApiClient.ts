/* eslint-disable @typescript-eslint/no-explicit-any */
export class WcaApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.WCA_URL}/api/v0`;
  }

  async getWcaUserInfo(token: string) {
    const response = await fetch(`${this.baseUrl}/me`);

    if (!response.ok)
      throw new Error('Failed to fetch user info from WCA API');

    return await response.json();
  }

  async getWcaCompetitionsInThailand() {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const params = {
        country_iso2: 'TH',
        start: todayString,
      }

      const response = await fetch(`${process.env.WCA_URL}/api/v0/competitions?${new URLSearchParams(params)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      return data.map((comp: any) => ({
        ...comp,
        competitionId: comp.id,
        shortName: comp.short_name,
        startDate: new Date(comp.start_date), 
        endDate: new Date(comp.end_date)
      }));
    }
    catch (error) {
      console.error('Failed to fetch WCA competitions:', error);
      return [];
    }
  }
}