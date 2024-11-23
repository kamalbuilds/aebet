# AEBet - Decentralized Betting Platform
> Secure, scalable peer-to-peer betting powered by æternity state channels

## Problem Statement
Traditional online betting platforms face several challenges:
- High transaction fees eating into user profits
- Slow settlement times
- Lack of transparency in odds and payouts
- Centralized control of user funds
- Limited scalability during peak betting periods
- Privacy concerns around betting activity

## Solution
AEBet leverages æternity's state channels to enable:
- Off-chain betting with near-instant settlements
- Zero-fee transactions between players
- Fully transparent and verifiable betting logic
- Non-custodial betting (users control their funds)
- Private betting activity (only final settlements on-chain)
- Highly scalable infrastructure for concurrent betting

## Key Features

### 1. State Channel Betting
- Direct peer-to-peer betting through state channels
- Instant bet placement and settlement
- Automatic payment distribution
- Privacy-preserving off-chain transactions
- Dispute resolution mechanism

### 2. Smart Contract Security  
- Sophia smart contracts with formal verification
- Automated escrow of betting funds
- Fair and transparent betting logic
- Built-in timeout and dispute handling
- Emergency withdrawal mechanisms

### 3. Scalable Architecture
- Elixir/OTP middleware for high concurrency
- Connection pooling for channel management
- Automatic channel recovery and reconnection
- Load balancing of betting channels
- Efficient state synchronization

## Architecture

### Components

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     Client      │     │     Server       │     │   Blockchain    │
│  (TypeScript)   │◄────┤  (Node.js/Elixir)│◄────┤   (Aeternity)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │                        │                        │
    Channel Client         Channel Service          State Channels
        │                        │                        │
        │                        │                        │
   User Interface         Channel Manager           Smart Contracts

### Layers

1. **Smart Contract Layer** (`contracts/Betting.aes`)
- Manages betting state and logic
- Handles bet placement and resolution
- Controls fund distribution
- Implements dispute resolution
- Emits events for tracking

2. **Channel Service Layer** (`server/src/channel-service.ts`)
- Manages state channel lifecycle
- Handles channel errors and recovery
- Synchronizes state between parties
- Processes betting events
- Manages channel connections

3. **Client Layer** (`client/src/channel-client.ts`)
- Provides user interface
- Manages wallet connections
- Handles channel state
- Signs transactions
- Processes user actions

4. **Middleware Layer** (`lib/channel_middleware.ex`)
- Manages concurrent channels
- Handles connection pooling
- Provides load balancing
- Ensures state persistence
- Processes channel events

## Implementation Details

### Smart Contract (`Betting.aes`)
```sophia
payable contract Betting =
  record state = {
    player1: address,
    player2: address,
    bet_amount: int,
    game_state: int,
    winner: option(address)
  }
```

### Channel Client (`channel-client.ts`)
```typescript
export class ChannelClient {
  async placeBet(amount: number) {
    return this.channel.callContract({
      amount,
      contract: this.config.contractAddress,
      abiVersion: 1,
      callData: 'cb_place_bet'
    });
  }
}
```

### Channel Service (`channel-service.ts`)
```typescript
export class ChannelService {
  private channels: Map<string, Channel> = new Map();
  
  async createChannel(config: ChannelOptions): Promise<Channel> {
    const channel = await Channel.initialize(config);
    this.channels.set(channel.id(), channel);
    return channel;
  }
}
```

## Setup & Installation

1. **Prerequisites**
```bash
# Install Node.js dependencies
npm install

# Install Elixir dependencies
mix deps.get

# Start Aeternity node
docker-compose up -d
```

2. **Environment Configuration**
```bash
# .env
AE_NODE_URL=http://localhost:3013
AE_COMPILER_URL=http://localhost:3080
AE_NETWORK_ID=ae_devnet
CHANNEL_RESERVE=10000
```

3. **Start Services**
```bash
# Start middleware
mix run --no-halt

# Start backend
npm run start:server

# Start frontend
npm run start:client
```

## Usage Guide

### 1. Initialize Channel
```typescript
const client = new ChannelClient({
  url: 'wss://testnet.aeternity.io/channel',
  role: 'initiator',
  initiatorId: 'ak_initiator...',
  responderId: 'ak_responder...',
  initiatorAmount: 10000,
  responderAmount: 10000
});

await client.init();
```

### 2. Place Bet
```typescript
// Place bet with amount
await client.placeBet(100);
```

### 3. Resolve Game
```typescript
// Resolve game with winner
await client.resolveGame('ak_winner...');
```

### 4. Close Channel
```typescript
// Close channel and settle
await client.closeChannel();
```

## Error Handling

1. **Channel Errors**
- Automatic reconnection on timeout
- Graceful shutdown on fatal errors
- State recovery after disconnection
- Transaction verification

2. **Contract Errors**
- Invalid state transitions
- Insufficient funds
- Unauthorized actions
- Timeout handling

## Testing

```bash
# Run contract tests
npm run test:contract

# Run channel service tests
npm run test:service

# Run integration tests
npm run test:integration
```

## Deployment

1. **Local Development**
```bash
npm run deploy:local
```

2. **Testnet Deployment**
```bash
npm run deploy:testnet
```

3. **Mainnet Deployment**
```bash
npm run deploy:mainnet
```

## Security Considerations

### 1. Channel Security
- Regular state verification
- Timeout monitoring
- Dispute resolution
- Emergency withdrawals

### 2. Contract Security
- Access control
- State validation
- Fund protection
- Event monitoring

### 3. Infrastructure Security
- Encrypted communication
- Rate limiting
- Input validation
- Error logging

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/xyz`)
3. Commit changes (`git commit -am 'Add xyz'`)
4. Push branch (`git push origin feature/xyz`)
5. Create Pull Request

## Resources

- [Aeternity Documentation](https://docs.aeternity.com/)
- [State Channels Guide](https://github.com/aeternity/protocol/blob/master/channels/README.md)
- [Sophia Language Docs](https://docs.aeternity.com/sophia/)
- [SDK Reference](https://docs.aeternity.com/aepp-sdk-js/)

## License

MIT License - see LICENSE.md

## Contact

- GitHub: [@aebet](https://github.com/aebet)
- Twitter: [@aebet_official](https://twitter.com/aebet_official)
- Discord: [AEBet Community](https://discord.gg/aebet)
