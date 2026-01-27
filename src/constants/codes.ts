export interface Code {
  chain_id: number;
  address: string;
  code: string;
  is_contract: boolean;
  kind: string; // "EOA" | "ERC20" | "ERC721" | "ERC1155" | "CONTRACT_UNKNOWN"
  name?: string;
  symbol?: string;
  decimals?: number;
  block_number: number;
  updated_at_unix: number;
}
