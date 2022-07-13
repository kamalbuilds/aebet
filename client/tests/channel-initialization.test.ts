import { render, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import ChannelInitialization from '../src/components/ChannelInitialization.vue';
import { createTestingPinia } from '@pinia/testing';

describe('Open State Channel Button', () => {
  expect(ChannelInitialization).toBeTruthy();
  it('should hide button after clicking it and show loader', async () => {
    const channelComp = render(ChannelInitialization, {
      global: {
        plugins: [createTestingPinia()],
      },
    });
    const button = channelComp.getByText('Start game');
    await fireEvent.click(button);
    // button is hidden after clicking it
    expect(() => {
      channelComp.getByText('Start game');
    }).toThrowError();

    channelComp.getByText('Setting ‘on-chain’ operations...');
  });

  it('shows error message on error', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: 'error',
          }),
      })
    );

    const channelComp = render(ChannelInitialization, {
      global: {
        plugins: [createTestingPinia()],
      },
    });
    const button = channelComp.getByText('Start game');
    await fireEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(
      channelComp.getByText('Error: Error while fetching channel config')
    ).toBeTruthy();
  });
});
