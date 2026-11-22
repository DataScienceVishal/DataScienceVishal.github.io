/**
 * Where the Find the Wrecker server lives: the find-the-wrecker-api Container
 * App on Azure. Nothing here is secret. The browser calls this address
 * directly, because GitHub Pages cannot forward /api the way the twin's Vercel
 * rewrite does, and the server allows this site's origin and no other.
 *
 * If this is ever set to an empty string, the page says the game server is not
 * running and offers no Watch button, rather than pretending to connect.
 * Browser tests never reach this host: tests/e2e/no-live-server.ts answers it.
 */
export const DEADPAN_API: string = "https://find-the-wrecker-api.bravecoast-78fd612a.francecentral.azurecontainerapps.io";
