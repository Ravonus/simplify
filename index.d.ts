declare module "@ethersproject/providers" {
  import { type Networkish } from "@ethersproject/networks";

  export class InfuraProvider {
    constructor(network?: Networkish, apiKey?: string);
  }
}
