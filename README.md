# Aviation Weather Telegram Bot ✈️

A Telegram bot built with NestJS that provides real-time aviation weather data (METAR and TAF) for any ICAO airport code worldwide.

## Features

- 🌤️ **Real-time Weather Data**: Fetches current METAR and TAF from [Aviation Weather Center](https://aviationweather.gov)
- 🚦 **Flight Category**: Displays VFR/MVFR/IFR/LIFR conditions at a glance
- ⚡ **Fast Response**: Shows loading indicator while collecting data
- 🛡️ **Rate Limiting**: Built-in protection (15 requests per 10 minutes per user)
- 💬 **Clean Formatting**: Uses code blocks to prevent link highlighting in mobile apps
- 🏥 **Health Check**: HTTP endpoint for keeping the bot alive on free hosting platforms
- 🔧 **Developer Mode**: Bypass rate limiting during development

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Telegram**: [nestjs-telegraf](https://www.npmjs.com/package/nestjs-telegraf)
- **HTTP Client**: [@nestjs/axios](https://www.npmjs.com/package/@nestjs/axios)
- **Package Manager**: [Bun](https://bun.sh/)
- **Language**: TypeScript

## Prerequisites

- [Bun](https://bun.sh/) installed
- Telegram Bot Token from [@BotFather](https://t.me/botfather)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aviation-weather-bot
```

2. Install dependencies:
```bash
bun install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your bot token to `.env`:
```env
BOT_TOKEN=your_telegram_bot_token_here
```

## Usage

### Development

```bash
bun run start:dev
```

### Production

```bash
bun run build
bun run start:prod
```

## Bot Commands

- `/start` - Welcome message and instructions
- `/help` - List available commands
- Send any 4-letter ICAO code (e.g., `KJFK`, `EGLL`, `UUDD`) to get weather data

## Response Format

```
Thu, 09 Jan 2026 14:51:00 UTC

✈️ New York/JF Kennedy Intl, NY, US

Flight Category: VFR

METAR
METAR KJFK 091451Z 17012KT 10SM FEW060...

TAF
TAF KJFK 091532Z 0916/1018 17011KT P6SM...
```

### Flight Categories

The bot displays the current flight category based on ceiling and visibility:

- **VFR** (Visual Flight Rules) - Ceiling > 3,000 ft and visibility > 5 miles
- **MVFR** (Marginal VFR) - Ceiling 1,000-3,000 ft or visibility 3-5 miles
- **IFR** (Instrument Flight Rules) - Ceiling 500-1,000 ft or visibility 1-3 miles
- **LIFR** (Low IFR) - Ceiling < 500 ft or visibility < 1 mile

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BOT_TOKEN` | Telegram Bot API token | - | Yes |

### Rate Limiting

- **Limit**: 15 requests per 10 minutes per user
- **Penalty**: 1 hour block after exceeding limit
- **Bypass**: Not available in production

### Health Check Endpoint

The bot exposes a health check endpoint at `GET /`:
- Returns: `"Weather Bot is alive ✈️"`
- Used for: Keeping the bot alive on platforms like Render.com

## Project Structure

```
src/
├── app.controller.ts           # Health check endpoint
├── app.module.ts               # Root module
├── main.ts                     # Application entry point
├── rate-limiter/
│   └── rate-limiter.service.ts # Rate limiting logic
└── weather/
    ├── weather.service.ts      # API calls to Aviation Weather
    └── weather.update.ts       # Telegram bot handlers
```

## API Reference

The bot uses the [Aviation Weather Center API](https://aviationweather.gov/data/api/):
- **METAR Endpoint**: `https://aviationweather.gov/api/data/metar`
- **TAF Endpoint**: `https://aviationweather.gov/api/data/taf`
- **Format**: JSON
- **Rate Limit**: 100 requests per minute

## Deployment

### Render.com (Recommended)

1. Create a new Web Service
2. Connect your repository
3. Set environment variables:
   - `BOT_TOKEN`: Your Telegram bot token
4. Deploy

The health check endpoint (`/`) prevents the service from sleeping on the free tier.

### Other Platforms

The bot uses Long Polling by default, so it works on any platform that supports persistent processes.

## Development

### Disable Rate Limiting

During development, you may want unlimited testing. The rate limiter is always active in this version.

### Build

```bash
bun run build
```

### Linting

```bash
bun run lint
```

### Format

```bash
bun run format
```

## Testing Example ICAO Codes

- `KJFK` - New York JFK
- `EGLL` - London Heathrow
- `LFPG` - Paris Charles de Gaulle
- `EDDF` - Frankfurt
- `RJTT` - Tokyo Haneda

## License

[MIT](LICENSE)

## Author

Built with NestJS and ❤️ for aviation enthusiasts
