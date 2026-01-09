import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface MetarResponse {
  name: string;
  rawOb: string;
  fltCat: string;
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
  fltCat: string | null;
  error?: string;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly API_BASE = 'https://aviationweather.gov/api/data';

  constructor(private readonly httpService: HttpService) {}

  async getWeather(icaoCode: string): Promise<WeatherData> {
    const code = icaoCode.toUpperCase();
    const result: WeatherData = {
      name: null,
      date: null,
      metar: null,
      taf: null,
      fltCat: null,
    };

    try {
      const metarData = await this.fetchMetar(code);
      result.name = metarData.name;
      result.date = this.formatDate(metarData.reportTime);
      result.fltCat = metarData.fltCat;
      result.metar = metarData.rawOb;
    } catch (error) {
      this.logError('METAR', code, error);
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
    } catch (error) {
      this.logError('TAF', code, error);
      result.taf = null;
    }

    if (!result.metar && !result.taf) {
      this.logger.warn(
        `No weather data available for ${code} - both METAR and TAF failed`,
      );
      result.error = 'Station not found or data unavailable.';
    }

    return result;
  }

  private formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toUTCString().replace('GMT', 'UTC');
  }

  private logError(dataType: string, code: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    this.logger.error(
      `Failed to fetch ${dataType} for ${code}: ${errorMessage}`,
      errorStack,
    );
  }

  private async fetchWeatherData<T>(
    endpoint: string,
    code: string,
    errorMessage: string,
  ): Promise<T> {
    const url = `${this.API_BASE}/${endpoint}?ids=${code}&format=json`;
    const response = await firstValueFrom(this.httpService.get<T[]>(url));

    if (!response.data || response.data.length === 0) {
      throw new Error(errorMessage);
    }

    return response.data[0];
  }

  private async fetchMetar(code: string): Promise<MetarResponse> {
    return this.fetchWeatherData<MetarResponse>(
      'metar',
      code,
      'No METAR data available',
    );
  }

  private async fetchTaf(code: string): Promise<TafResponse> {
    return this.fetchWeatherData<TafResponse>(
      'taf',
      code,
      'No TAF data available',
    );
  }
}
