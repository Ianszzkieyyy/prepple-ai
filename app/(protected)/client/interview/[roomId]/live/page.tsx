import { headers } from 'next/headers';
import { App } from '@/components/app';
import { getAppConfig } from '@/lib/livekit/utils';

export default async function Page({
  params,
  searchParams,
}: {
  params: { roomId: string };
  searchParams: { candidateId?: string };
}) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  const { roomId } = params;
  const { candidateId } = searchParams;


  return <App appConfig={appConfig} roomId={roomId} candidateId={candidateId} />;
}
