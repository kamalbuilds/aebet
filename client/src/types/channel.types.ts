import { Encoded } from '@aeternity/aepp-sdk/es/utils/encoder';

export interface BettingState {
  player1: Encoded.AccountAddress;
  player2: Encoded.AccountAddress;
  bet_amount: bigint;
  game_state: number;
  winner: Encoded.AccountAddress | null;
}

export interface ChannelConfig {
  url: string;
  role: 'initiator' | 'responder';
  initiatorId: Encoded.AccountAddress;
  responderId: Encoded.AccountAddress;
  initiatorAmount: bigint;
  responderAmount: bigint;
  pushAmount: number;
  channelReserve: bigint;
  ttl: number;
  host: string;
  port: number;
  lockPeriod: number;
  stateTimeout: number;
  debug?: boolean;
}

export interface ContractCallParams {
  amount: bigint;
  contract: Encoded.ContractAddress;
  abiVersion: number;
  callData: Encoded.ContractBytearray;
  gas?: number;
}
