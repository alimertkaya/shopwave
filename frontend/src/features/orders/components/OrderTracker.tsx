import { Check, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { ORDER_STATUS, ORDER_STATUS_LABEL, type OrderStatus } from '@/shared/constants/orderStatus';

const STEPS: OrderStatus[] = [
  ORDER_STATUS.CREATED,
  ORDER_STATUS.PAYMENT_PROCESSED,
  ORDER_STATUS.STOCK_RESERVED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.COMPLETED,
];

interface Props {
  status: OrderStatus;
}

export const OrderTracker = ({ status }: Props) => {
  const isCancelled = status === ORDER_STATUS.CANCELLED;
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
          <X className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      ) : (
        <ol className="relative flex flex-col gap-0">
          {STEPS.map((step, idx) => {
            const isCompleted = status === ORDER_STATUS.COMPLETED;
            const completed = isCompleted ? true : idx < currentIndex;
            const active = !isCompleted && idx === currentIndex;
            const { label } = ORDER_STATUS_LABEL[step];

            return (
              <li key={step} className="flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors',
                      completed
                        ? 'bg-primary border-primary text-primary-foreground'
                        : active
                          ? 'border-primary text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground/30'
                    )}
                  >
                    {completed ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'w-0.5 flex-1 mt-1',
                        completed ? 'bg-primary' : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>
                <div className="pt-1.5 pb-2">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      active
                        ? 'text-foreground'
                        : completed
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/40'
                    )}
                  >
                    {label}
                  </p>
                  {active && (
                    <p className="text-xs text-primary mt-0.5 animate-pulse">Processing...</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
