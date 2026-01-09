import { Update, Start, Help, On, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { WeatherService } from './weather.service';
import { RateLimiterService } from '../rate-limiter/rate-limiter.service';

@Update()
export class WeatherUpdate {
  private readonly ICAO_REGEX = /^[A-Za-z]{4}$/;

  constructor(
    private readonly weatherService: WeatherService,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

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

    // Check rate limit (only for valid ICAO requests)
    const userId = ctx.from?.id;
    if (!userId) {
      return;
    }

    if (!this.rateLimiterService.isAllowed(userId)) {
      const blockedUntil = this.rateLimiterService.getBlockedUntil(userId);
      const minutesLeft = blockedUntil
        ? Math.ceil((blockedUntil.getTime() - Date.now()) / 60000)
        : 60;
      await ctx.reply(
        `Too many requests. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
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
      response += `<b>METAR</b>\n<pre>${weather.metar}</pre>\n`;
    }

    if (weather.taf) {
      if (weather.metar) response += '\n';
      response += `<b>TAF</b>\n<pre>${weather.taf}</pre>`;
    }

    await ctx.reply(response, { parse_mode: 'HTML' });
  }
}
