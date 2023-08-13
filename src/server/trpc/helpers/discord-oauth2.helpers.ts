import DiscordOauth2 from 'discord-oauth2';

export function createDiscordOAuth2() {
  const config = {
    clientId: process.env['DISCORD_CLIENT_ID'],
    clientSecret: process.env['DISCORD_CLIENT_SECRET'],
    redirectUri: process.env['DISCORD_REDIRECT_URI'],
  };
  return new DiscordOauth2(config);
}
