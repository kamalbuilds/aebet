defmodule ChannelMiddleware do
  use GenServer
  
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(opts) do
    {:ok, %{channels: %{}, node: opts[:node]}}
  end

  def handle_call({:create_channel, config}, _from, state) do
    case Channel.initialize(config) do
      {:ok, channel} ->
        new_state = put_in(state.channels[channel.id], channel)
        {:reply, {:ok, channel}, new_state}
      
      {:error, reason} ->
        {:reply, {:error, reason}, state} 
    end
  end

  def handle_call({:close_channel, channel_id}, _from, state) do
    with {:ok, channel} <- Map.fetch(state.channels, channel_id),
         :ok <- Channel.shutdown(channel) do
      new_state = update_in(state.channels, &Map.delete(&1, channel_id))
      {:reply, :ok, new_state}
    else
      error -> {:reply, error, state}
    end
  end

  # Handle channel events
  def handle_info({:channel_update, channel_id, update}, state) do
    # Process channel update
    {:noreply, state} 
  end
end 