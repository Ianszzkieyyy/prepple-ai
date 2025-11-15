import type { AppConfig } from './lib/livekit/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'PreppleAI',
  pageTitle: 'PreppleAI Voice Agent',
  pageDescription: 'PreppleAI Voice Agent powered by LiveKit Agents',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#002cf2',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#1fd5f9',
  startButtonText: 'Start Interview',

  agentName: undefined,
};
