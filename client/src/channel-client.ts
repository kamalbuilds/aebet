import { Channel, Contract, Node } from '@aeternity/aepp-sdk';
import { ChannelOptions } from '@aeternity/aepp-sdk/es/channel/internal';
import { Encoded } from '@aeternity/aepp-sdk/es/utils/encoder';
import {
  BettingState,
  ChannelConfig,
  ContractCallParams,
} from './types/channel.types';

export class ChannelClient {
  private channel: Channel;
  private config: ChannelConfig;
  private contract: Contract;
  private node: Node;

  constructor(config: ChannelConfig, node: Node) {
    this.config = config;
    this.node = node;
  }

  async init(): Promise<void> {
    try {
      // Initialize channel
      this.channel = await Channel.initialize({
        ...this.config,
        sign: async (tag: string, tx: string) => {
          return this.node.signTransaction(tx);
        },
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Wait for channel to open
      await this.waitForChannelOpen();

      // Deploy contract if initiator
      if (this.config.role === 'initiator') {
        await this.deployContract();
      }
    } catch (error) {
      console.error('Channel initialization failed:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Handle state changes
    this.channel.on('stateChanged', async (tx: string) => {
      console.log('Channel state changed:', tx);
      await this.processStateUpdate(tx);
    });

    // Handle status changes
    this.channel.on('statusChanged', (status: string) => {
      console.log('Channel status:', status);
      this.handleStatusChange(status);
    });

    // Handle errors
    this.channel.on('error', (error: Error) => {
      console.error('Channel error:', error);
      this.handleError(error);
    });
  }

  private async waitForChannelOpen(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Channel open timeout'));
      }, this.config.stateTimeout);

      this.channel.on('statusChanged', (status: string) => {
        if (status === 'open') {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  }

  async placeBet(amount: bigint): Promise<void> {
    try {
      // Verify channel is open
      if (!this.isChannelOpen()) {
        throw new Error('Channel not open');
      }

      // Build contract call
      const callParams: ContractCallParams = {
        amount,
        contract: this.contract.address as Encoded.ContractAddress,
        abiVersion: this.contract.abiVersion,
        callData: await this.contract.encodeFunctionCall('place_bet', []),
        gas: 50000,
      };

      // Execute contract call
      const result = await this.channel.callContract(
        callParams,
        async (tx: string) => this.node.signTransaction(tx)
      );

      if (!result.accepted) {
        throw new Error('Bet placement rejected');
      }

      // Update local state
      await this.processStateUpdate(result.signedTx);
    } catch (error) {
      console.error('Bet placement failed:', error);
      throw error;
    }
  }

  async resolveGame(winner: Encoded.AccountAddress): Promise<void> {
    try {
      const callParams: ContractCallParams = {
        amount: BigInt(0),
        contract: this.contract.address as Encoded.ContractAddress,
        abiVersion: this.contract.abiVersion,
        callData: await this.contract.encodeFunctionCall('resolve', [winner]),
        gas: 50000,
      };

      const result = await this.channel.callContract(
        callParams,
        async (tx: string) => this.node.signTransaction(tx)
      );

      if (!result.accepted) {
        throw new Error('Game resolution rejected');
      }
    } catch (error) {
      console.error('Game resolution failed:', error);
      throw error;
    }
  }

  async closeChannel(): Promise<void> {
    try {
      // Verify channel can be closed
      const state = await this.getState();
      if (state.game_state !== 3) {
        // 3 = complete
        throw new Error('Game not complete');
      }

      // Initiate mutual close
      await this.channel.shutdown(async (tx: string) =>
        this.node.signTransaction(tx)
      );
    } catch (error) {
      console.error('Channel close failed:', error);
      throw error;
    }
  }

  private async deployContract(): Promise<void> {
    // Contract deployment code
    const contractSource = `...`; // Contract source code
    const bytecode = await this.node.compileContract(contractSource);

    this.contract = await this.channel.createContract(
      {
        bytecode,
        callData: 'cb_...', // Initialize call data
      },
      async (tx: string) => this.node.signTransaction(tx)
    );
  }

  private async processStateUpdate(tx: string): Promise<void> {
    const state = await this.getState();
    // Emit state update event
    this.emit('stateUpdate', state);
  }

  private handleStatusChange(status: string): void {
    switch (status) {
      case 'open':
        this.emit('channelOpen');
        break;
      case 'closed':
        this.emit('channelClosed');
        break;
      // Handle other statuses
    }
  }

  private handleError(error: Error): void {
    if (error.name === 'ChannelPingTimedOutError') {
      void this.reconnect();
    } else {
      this.emit('error', error);
    }
  }

  private async reconnect(): Promise<void> {
    try {
      this.channel = await Channel.initialize({
        ...this.config,
        existingChannelId: this.channel.id(),
        existingFsmId: this.channel.fsmId(),
      });
      this.setupEventHandlers();
    } catch (error) {
      console.error('Channel reconnection failed:', error);
      this.emit('error', error);
    }
  }

  private async getState(): Promise<BettingState> {
    const result = await this.contract.call('get_state', []);
    return result.decodedResult;
  }

  private isChannelOpen(): boolean {
    return this.channel?.status() === 'open';
  }

  private emit(event: string, data?: any): void {
    // Implement event emission
  }
}
