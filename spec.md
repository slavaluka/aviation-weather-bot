# Project: Aviation Weather Telegram Bot (NestJS)

## 1. Goal
Create a Telegram bot using NestJS that allows users to request current aviation weather (METAR) and forecasts (TAF) by sending an ICAO airport code (e.g., KJFK, UUDD, EGLL).

## 2. Tech Stack
- **Framework:** NestJS (Standard architecture)
- **Telegram Wrapper:** `nestjs-telegraf`
- **HTTP Client:** `@nestjs/axios`
- **Environment:** `@nestjs/config` (for managing the BOT_TOKEN safely)
- **Language:** TypeScript

## 3. Functional Requirements

### A. Commands
- `/start`: Reply with a welcome message explaining how to use the bot.
- `/help`: List available commands.

### B. Message Handling
- **Text Input:** The bot must listen for any 4-letter text input.
- **Validation:** Check if the input matches the ICAO format regex: `^[A-Za-z]{4}$`.
- **Action:** If valid, fetch data from NOAA public servers.

### C. Data Source (NOAA)
Do not use an API key. Use the public text file servers from NOAA:
- **METAR URL:** `https://tgftp.nws.noaa.gov/data/observations/metar/stations/{CODE}.TXT`
- **TAF URL:** `https://tgftp.nws.noaa.gov/data/forecasts/taf/stations/{CODE}.TXT`
*Note: `{CODE}` must be uppercase.*

### D. Response Logic
1. User sends "UUDD".
2. Bot fetches METAR.
3. Bot fetches TAF (if available).
4. Bot replies with a single message containing both (or error if not found).
5. **Error Handling:** If the HTTP request fails (404), reply with "Station not found or data unavailable."

## 4. Architecture Specifications
- **AppModule:** Import `TelegrafModule`, `HttpModule`, and `ConfigModule`.
- **WeatherService:** Handle the `axios` calls to NOAA. Parse the response (strip the first line which is usually a timestamp, return the raw weather string).
- **WeatherUpdate:** The class decorated with `@Update()`. Use `@Start()` for the welcome message and `@On('text')` to catch ICAO codes.

## 5. Setup Instructions (for the AI to execute)
1. Initialize a new NestJS project.
2. Install dependencies: `nestjs-telegraf`, `telegraf`, `@nestjs/axios`, `axios`, `@nestjs/config`.
3. Create a `.env.example` file with `BOT_TOKEN`.
4. Generate the Service and Update files.
5. Write the logic.

## 6. Tone
The bot's replies should be concise and functional. Raw data format is preferred by pilots.