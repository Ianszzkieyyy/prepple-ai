import { Button } from '@/components/ui/button';
import { cn } from '@/lib/livekit/utils';
import LogoIcon from '@/public/logo-icon.svg';
import Image from 'next/image';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: () => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  return (
    <section
      ref={ref}
      inert={disabled}
      className={cn(
        'bg-background fixed inset-0 mx-auto flex h-svh flex-col items-center justify-center text-center',
        disabled ? 'z-10' : 'z-20'
      )}
    >
      <div className='mb-8'>
        <Image src={LogoIcon} alt="PreppleAI Logo" width={64} height={64} />
      </div>
      <p className="text-fg1 max-w-prose pt-1 leading-6 font-medium">
        Welcome to your Prepple AI interview! When you&apos;re ready, click the button below to begin.
      </p>
      <Button size="lg" onClick={onStartCall} className="mt-6 w-64 font-mono">
        {startButtonText}
      </Button>
      <footer className="fixed bottom-5 left-0 z-20 flex w-full items-center justify-center">
        <p className="text-fg1 max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          Powered by Prepple AI & LiveKit Agents. Provided by GENI Solutions.
        </p>
      </footer>
    </section>
  );
};
