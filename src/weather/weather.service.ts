import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface MetarResponse {
  name: string;
  rawOb: string;
  reportTime: string;
}

interface TafResponse {
  name: string;
  rawTAF: string;
  issueTime: string;
}

export interface WeatherData {
  name: string | null;
  date: string | null;
  metar: string | null;
  taf: string | null;
  error?: string;
}

@Injectable()
export class WeatherService {
  private readonly API_BASE = 'https://aviationweather.gov/api/data';

  constructor(private readonly httpService: HttpService) {}

  async getWeather(icaoCode: string): Promise<WeatherData> {
    const code = icaoCode.toUpperCase();
    const result: WeatherData = {
      name: null,
      date: null,
      metar: null,
      taf: null,
    };

    try {
      const metarData = await this.fetchMetar(code);
      result.name = metarData.name;
      result.date = this.formatDate(metarData.reportTime);
      result.metar = metarData.rawOb;
    } catch {
      result.metar = null;
    }

    try {
      const tafData = await this.fetchTaf(code);
      if (!result.name) {
        result.name = tafData.name;
      }
      if (!result.date) {
        result.date = this.formatDate(tafData.issueTime);
      }
      result.taf = tafData.rawTAF;
    } catch {
      result.taf = null;
    }

    if (!result.metar && !result.taf) {
      result.error = 'Station not found or data unavailable.';
    }

    return result;
  }

  private formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toUTCString().replace('GMT', 'UTC');
  }

  private async fetchMetar(code: string): Promise<MetarResponse> {
    const url = `${this.API_BASE}/metar?ids=${code}&format=json`;
    const response = await firstValueFrom(
      this.httpService.get<MetarResponse[]>(url),
    );

    if (!response.data || response.data.length === 0) {
      throw new Error('No METAR data available');
    }

    return response.data[0];
  }

  private async fetchTaf(code: string): Promise<TafResponse> {
    const url = `${this.API_BASE}/taf?ids=${code}&format=json`;
    const response = await firstValueFrom(
      this.httpService.get<TafResponse[]>(url),
    );

    if (!response.data || response.data.length === 0) {
      throw new Error('No TAF data available');
    }

    return response.data[0];
  }
}
