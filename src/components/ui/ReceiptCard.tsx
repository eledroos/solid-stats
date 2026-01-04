import { ReactNode } from 'react';
import { Ticket } from 'lucide-react';

interface ReceiptCardProps {
  children: ReactNode;
  title?: string;
}

export function ReceiptCard({ children, title }: ReceiptCardProps) {
  return (
    <div className="relative drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:drop-shadow-[8px_8px_0px_rgba(59,130,246,0.5)] mb-8">
      <div className="bg-white dark:bg-slate-800 border-x-4 border-t-4 border-black dark:border-primary p-6 pb-12 relative z-10 receipt-content">
        {title && (
          <div className="text-center border-b-4 border-dashed border-black dark:border-primary pb-4 mb-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter inline-flex items-center gap-2">
              <Ticket className="w-6 h-6"/> {title}
            </h3>
          </div>
        )}
        {children}

        {/* Jagged Edge Generator (CSS Radial Gradient) */}
        <div
          className="absolute -bottom-4 left-[-4px] right-[-4px] h-6 border-t-0 dark:hidden"
          style={{
            background: "linear-gradient(135deg, transparent 10px, white 0) 0 0, linear-gradient(-135deg, transparent 10px, white 0) 0 0",
            backgroundSize: "20px 20px",
            backgroundRepeat: "repeat-x",
            filter: "drop-shadow(0px 4px 0px black)"
          }}
        />
        {/* Dark mode jagged edge */}
        <div
          className="absolute -bottom-4 left-[-4px] right-[-4px] h-6 border-t-0 hidden dark:block"
          style={{
            background: "linear-gradient(135deg, transparent 10px, #1E293B 0) 0 0, linear-gradient(-135deg, transparent 10px, #1E293B 0) 0 0",
            backgroundSize: "20px 20px",
            backgroundRepeat: "repeat-x",
            filter: "drop-shadow(0px 4px 0px rgba(59,130,246,0.5))"
          }}
        />
      </div>
    </div>
  );
}
