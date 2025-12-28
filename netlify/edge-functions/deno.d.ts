// Type declarations for Deno global in Netlify Edge Functions
declare namespace Deno {
    export namespace env {
        export function get(key: string): string | undefined;
    }
}
