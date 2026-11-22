/**
 * Where the Deadpan server lives. Nothing here is secret: the browser calls
 * this address directly, because GitHub Pages cannot forward /api the way the
 * twin's Vercel rewrite does, and the server allows this site's origin.
 *
 * Empty until the Container App exists. While it is empty the page says the
 * server is not running yet, rather than pretending to connect.
 */
export const DEADPAN_API: string = "";
