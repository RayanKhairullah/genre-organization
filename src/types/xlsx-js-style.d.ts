declare module 'xlsx-js-style' {
  // Minimal typings needed for runtime usage in the project
  export const utils: {
    aoa_to_sheet(data: any[][]): any
    book_new(): any
    book_append_sheet(wb: any, ws: any, name: string): void
    encode_cell(addr: { r: number; c: number }): string
    encode_range(range: any): string
    decode_range(ref: string): any
  }
  export function writeFile(wb: any, filename: string): void
}
