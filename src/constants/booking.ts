export const BOOKING_STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  PAID: 'default',
  CANCELLED: 'destructive',
  EXPIRED: 'secondary',
};
