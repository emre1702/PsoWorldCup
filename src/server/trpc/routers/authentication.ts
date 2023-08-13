import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import DiscordOauth2 from 'discord-oauth2';
import { createDiscordOAuth2 } from '../helpers/discord-oauth2.helpers';

const authUrlProcedure = publicProcedure
  .output(
    z.object({
      authUrl: z.string(),
      state: z.string(),
    })
  )
  .query(() => {
    const config = {
      clientId: process.env['DISCORD_CLIENT_ID'],
      clientSecret: process.env['DISCORD_CLIENT_SECRET'],
      redirectUri: process.env['DISCORD_REDIRECT_URI'],
    };
    const oauth2 = new DiscordOauth2(config);
    // Generate random string
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    return {
      authUrl: oauth2.generateAuthUrl({
        scope: ['identify'],
        state: state,
      }),
      state,
    };
  });

const authTokenProcedure = publicProcedure
  .input(
    z.string().refine((token) => {
      return token.length > 0;
    })
  )
  .output(
    z.object({
      access_token: z.string(),
      refresh_token: z.string(),
    })
  )
  .query(async (opts) => {
    const oauth2 = createDiscordOAuth2();
    const tokenResult = await oauth2.tokenRequest({
      code: opts.input,
      scope: ['identify'],
      grantType: 'authorization_code',
    });
    return tokenResult;
  });

const discordUserProcedure = publicProcedure
  .input(
    z.string().refine((token) => {
      return token.length > 0;
    })
  )
  .output(
    z.object({
      id: z.string(),
      username: z.string(),
      avatar: z.string().nullable().optional(),
      discriminator: z.string(),
      public_flags: z.number().optional(),
      flags: z.number().optional(),
      locale: z.string().optional(),
      mfa_enabled: z.boolean().optional(),
      premium_type: z.number().optional(),
      email: z.string().nullable().optional(),
      verified: z.boolean().optional(),
      banner: z.string().nullable().optional(),
      accent_color: z.string().nullable().optional(),
    })
  )
  .query(async (opts) => {
    const oauth2 = createDiscordOAuth2();
    const user = await oauth2.getUser(opts.input);
    return user;
  });

export const authenticationRouter = router({
  authUrl: authUrlProcedure,
  authToken: authTokenProcedure,
  discordUser: discordUserProcedure,
});
