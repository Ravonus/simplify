declare module "colorthief" {
  export default class ColorThief {
    getColor(
      sourceImage: HTMLImageElement | HTMLCanvasElement,
      quality?: number
    ): number[];
    getPalette(
      sourceImage: HTMLImageElement | HTMLCanvasElement,
      colorCount?: number,
      quality?: number
    ): number[][];
  }
}
