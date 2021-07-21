import Portis from "@portis/web3";
import Web3 from "web3";

export const portis = new Portis('9b58c894-cac3-4614-95ca-b5d94cac84b3', 'mainnet');
export const web3 = new Web3(portis.provider);