export const ORDER_STATUS = {
  CREATED:           'CREATED',
  PAYMENT_PROCESSED: 'PAYMENT_PROCESSED',
  STOCK_RESERVED:    'STOCK_RESERVED',
  SHIPPED:           'SHIPPED',
  COMPLETED:         'COMPLETED',
  CANCELLED:         'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<OrderStatus, { label: string; className: string }> = {
  CREATED:           { label: 'Created',          className: 'border-slate-400  bg-slate-50   text-slate-700  dark:bg-slate-900  dark:text-slate-300'  },
  PAYMENT_PROCESSED: { label: 'Payment Received', className: 'border-blue-400   bg-blue-50    text-blue-700   dark:bg-blue-950   dark:text-blue-300'   },
  STOCK_RESERVED:    { label: 'Stock Reserved',   className: 'border-violet-400 bg-violet-50  text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  SHIPPED:           { label: 'Shipped',          className: 'border-amber-400  bg-amber-50   text-amber-700  dark:bg-amber-950  dark:text-amber-300'  },
  COMPLETED:         { label: 'Delivered',        className: 'border-green-500  bg-green-50   text-green-700  dark:bg-green-950  dark:text-green-300'  },
  CANCELLED:         { label: 'Cancelled',        className: 'border-red-400    bg-red-50     text-red-700    dark:bg-red-950    dark:text-red-300'    },
};
