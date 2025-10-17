import { headers } from 'next/headers';
import { App } from '@/components/app';
import { getAppConfig } from '@/lib/livekit/utils';

export default async function Page() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <App appConfig={appConfig} />;
}
