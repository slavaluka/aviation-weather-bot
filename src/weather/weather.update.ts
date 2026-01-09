import { Update, Start, Help, On, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { WeatherService } from './weather.service';

@Update()
export class WeatherUpdate {
  private readonly ICAO_REGEX = /^[A-Za-z]{4}$/;

  constructor(private readonly weatherService: WeatherService) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply(
      'Aviation Weather Bot\n\n' +
        'Send a 4-letter ICAO airport code (e.g., KJFK, UUDD, EGLL) ' +
        'to get current METAR and TAF data.\n\n' +
        'Use /help for more information.',
    );
  }

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply(
      'Available commands:\n' +
        '/start - Welcome message\n' +
        '/help - Show this help\n\n' +
        'Or simply send a 4-letter ICAO code to get weather data.',
    );
  }

  @On('text')
  async onText(@Ctx() ctx: Context): Promise<void> {
    const message = ctx.message;
    if (!message || !('text' in message)) {
      return;
    }

    const text = message.text.trim();

    if (text.startsWith('/')) {
      return;
    }

    if (!this.ICAO_REGEX.test(text)) {
      await ctx.reply(
        'Please send a valid 4-letter ICAO airport code (e.g., KJFK).',
      );
      return;
    }

    const weather = await this.weatherService.getWeather(text);

    if (weather.error) {
      await ctx.reply(weather.error);
      return;
    }

    let response = '';

    if (weather.date && weather.name) {
      response += `${weather.date}\n\n\u2708\uFE0F ${weather.name}\n\n`;
    }

    if (weather.metar) {
      response += `<b>METAR</b>\n\n${weather.metar}`;
    }

    if (weather.taf) {
      if (weather.metar) response += '\n\n';
      response += `<b>TAF</b>\n\n${weather.taf}`;
    }

    await ctx.reply(response, { parse_mode: 'HTML' });
  }
}
