import { Channel, MemoryAccount, Node } from '@aeternity/aepp-sdk';
import { ChannelOptions } from '@aeternity/aepp-sdk/es/channel/internal';

export class ChannelClient {
  private channel: Channel;
  private config: ChannelOptions;

  constructor(config: ChannelOptions) {
    this.config = config;
  }

  async init() {
    this.channel = await Channel.initialize(this.config);
    
    // Handle channel state changes
    this.channel.on('stateChanged', async (tx) => {
      console.log('Channel state changed:', tx);
    });

    // Handle channel status changes  
    this.channel.on('statusChanged', (status) => {
      console.log('Channel status:', status);
    });
  }

  async placeBet(amount: number) {
    const callData = await this.channel.callContract({
      amount,
      contract: this.config.contractAddress,
      abiVersion: 1,
      callData: 'cb_place_bet'
    });
    return callData;
  }

  async resolveGame(winner: string) {
    const callData = await this.channel.callContract({
      amount: 0,
      contract: this.config.contractAddress, 
      abiVersion: 1,
      callData: `cb_resolve_${winner}`
    });
    return callData;
  }

  async closeChannel() {
    await this.channel.shutdown();
  }
} 