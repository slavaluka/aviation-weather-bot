import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface WeatherData {
  metar: string | null;
  taf: string | null;
  error?: string;
}

@Injectable()
export class WeatherService {
  private readonly METAR_URL =
    'https://tgftp.nws.noaa.gov/data/observations/metar/stations';
  private readonly TAF_URL =
    'https://tgftp.nws.noaa.gov/data/forecasts/taf/stations';

  constructor(private readonly httpService: HttpService) {}

  async getWeather(icaoCode: string): Promise<WeatherData> {
    const code = icaoCode.toUpperCase();
    const result: WeatherData = { metar: null, taf: null };

    try {
      result.metar = await this.fetchMetar(code);
    } catch {
      result.metar = null;
    }

    try {
      result.taf = await this.fetchTaf(code);
    } catch {
      result.taf = null;
    }

    if (!result.metar && !result.taf) {
      result.error = 'Station not found or data unavailable.';
    }

    return result;
  }

  private async fetchMetar(code: string): Promise<string> {
    const url = `${this.METAR_URL}/${code}.TXT`;
    const response = await firstValueFrom(
      this.httpService.get<string>(url, { responseType: 'text' }),
    );
    return this.parseWeatherData(response.data);
  }

  private async fetchTaf(code: string): Promise<string> {
    const url = `${this.TAF_URL}/${code}.TXT`;
    const response = await firstValueFrom(
      this.httpService.get<string>(url, { responseType: 'text' }),
    );
    return this.parseWeatherData(response.data);
  }

  private parseWeatherData(data: string): string {
    const lines = data.trim().split('\n');
    if (lines.length > 1) {
      return lines.slice(1).join('\n').trim();
    }
    return data.trim();
  }
}
