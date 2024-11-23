import { Channel, Node } from '@aeternity/aepp-sdk';
import { ChannelOptions } from '@aeternity/aepp-sdk/es/channel/internal';

export class ChannelService {
  private channels: Map<string, Channel> = new Map();

  async createChannel(config: ChannelOptions): Promise<Channel> {
    const channel = await Channel.initialize(config);
    
    channel.on('error', (error) => {
      console.error('Channel error:', error);
      this.handleChannelError(channel, error);
    });

    channel.on('statusChanged', (status) => {
      if (status === 'closed') {
        this.channels.delete(channel.id());
      }
    });

    this.channels.set(channel.id(), channel);
    return channel;
  }

  private async handleChannelError(channel: Channel, error: Error) {
    if (error.name === 'ChannelPingTimedOutError') {
      await this.reconnectChannel(channel);
    } else {
      await this.closeChannel(channel.id());
    }
  }

  private async reconnectChannel(channel: Channel) {
    try {
      const newChannel = await Channel.initialize({
        ...channel.config,
        existingChannelId: channel.id(),
        existingFsmId: channel.fsmId()
      });
      this.channels.set(channel.id(), newChannel);
    } catch (error) {
      console.error('Channel reconnect failed:', error);
      await this.closeChannel(channel.id());
    }
  }

  async closeChannel(channelId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      await channel.shutdown();
      this.channels.delete(channelId);
    }
  }
} 