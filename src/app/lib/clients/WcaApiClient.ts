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
}