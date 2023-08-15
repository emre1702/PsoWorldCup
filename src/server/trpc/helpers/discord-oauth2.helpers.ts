import DiscordOauth2 from 'discord-oauth2';
import { ZodTypeAny, z } from 'zod';

export function createDiscordOAuth2() {
  const config = {
    clientId: process.env['DISCORD_CLIENT_ID'],
    clientSecret: process.env['DISCORD_CLIENT_SECRET'],
    redirectUri: process.env['DISCORD_REDIRECT_URI'],
  };
  return new DiscordOauth2(config);
}

export function zodInputWithAuth<T extends ZodTypeAny | z.ZodNull>(
  input: T
): z.ZodObject<{ input: T; token: z.ZodString }, 'strip'> {
  return z.object({
    token: z.string().min(1),
    input,
  });
}
