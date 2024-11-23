import { Node } from '@aeternity/aepp-sdk';
import { ChannelClient } from '../channel-client';
import { ChannelConfig } from '../types/channel.types';

async function startBetting() {
  // Initialize Node
  const node = await Node.new({
    url: 'https://testnet.aeternity.io',
    internalUrl: 'https://testnet.aeternity.io',
  });

  // Channel configuration
  const config: ChannelConfig = {
    url: 'wss://testnet.aeternity.io/channel',
    role: 'initiator',
    initiatorId: 'ak_initiator...',
    responderId: 'ak_responder...',
    initiatorAmount: BigInt('1000000000000000000'), // 1 AE
    responderAmount: BigInt('1000000000000000000'), // 1 AE
    pushAmount: 0,
    channelReserve: BigInt('100000000000000000'), // 0.1 AE
    ttl: 1000,
    host: 'localhost',
    port: 3001,
    lockPeriod: 10,
    stateTimeout: 20000,
    debug: true,
  };

  // Create channel client
  const client = new ChannelClient(config, node);

  try {
    // Initialize channel
    await client.init();
    console.log('Channel initialized');

    // Place bet
    await client.placeBet(BigInt('100000000000000000')); // 0.1 AE
    console.log('Bet placed');

    // Resolve game
    await client.resolveGame('ak_winner...');
    console.log('Game resolved');

    // Close channel
    await client.closeChannel();
    console.log('Channel closed');
  } catch (error) {
    console.error('Betting failed:', error);
  }
}

void startBetting();
