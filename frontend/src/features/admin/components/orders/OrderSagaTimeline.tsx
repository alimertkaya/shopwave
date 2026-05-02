import { Check, X, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { ORDER_STATUS, type OrderStatus } from '@/shared/constants/orderStatus';

const SAGA_STEPS: { key: OrderStatus; label: string }[] = [
  { key: ORDER_STATUS.CREATED,           label: 'Order Created'       },
  { key: ORDER_STATUS.PAYMENT_PROCESSED, label: 'Payment Received'    },
  { key: ORDER_STATUS.STOCK_RESERVED,    label: 'Stock Reserved'      },
  { key: ORDER_STATUS.SHIPPED,           label: 'Shipped'             },
  { key: ORDER_STATUS.COMPLETED,         label: 'Delivered'           },
];

interface Props {
  status: OrderStatus;
}

export const OrderSagaTimeline = ({ status }: Props) => {
  const isCancelled = status === ORDER_STATUS.CANCELLED;
  const currentIndex = SAGA_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="w-full overflow-x-auto">
      {isCancelled ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
          <X className="h-4 w-4 flex-shrink-0" />
          Order Cancelled
        </div>
      ) : (
        <ol className="flex items-start gap-1 min-w-max">
          {SAGA_STEPS.map((step, idx) => {
            const isCompleted = status === ORDER_STATUS.COMPLETED;
            const completed = isCompleted ? true : idx < currentIndex;
            const active = !isCompleted && idx === currentIndex;

            return (
              <li key={step.key} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'h-7 w-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      completed
                        ? 'bg-primary border-primary text-primary-foreground'
                        : active
                          ? 'border-primary text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground/30'
                    )}
                  >
                    {completed ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-xs text-center max-w-[72px]',
                      active
                        ? 'text-primary font-semibold'
                        : completed
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/40'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
                {idx < SAGA_STEPS.length - 1 && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 flex-shrink-0 mb-5',
                      completed ? 'text-primary' : 'text-muted-foreground/30'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
