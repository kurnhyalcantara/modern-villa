# Booking System

## Features

- Real-time availability
- Prevent double booking
- Booking expiration timer
- Booking history

## Booking Rules

### Validation

- Check date conflicts
- Validate guest count
- Prevent invalid date ranges

### Concurrency Protection

- Use database transactions
- Prevent simultaneous booking race conditions

### Transaction Flow

1. User selects villa
2. Availability checked
3. Booking locked temporarily
4. Payment processed
5. Booking confirmed

### Rollback Handling

- Failed payment must rollback booking

## Booking Status

- pending
- paid
- cancelled
- expired
