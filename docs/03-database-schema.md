# Database Schema

## Main Entities

### Users

- id
- email
- full_name
- avatar
- role
- balance
- created_at

### Villas

- id
- title
- slug
- description
- location
- price_per_night
- max_guests
- rating
- created_at

### VillaImages

- id
- villa_id
- image_url

### Bookings

- id
- user_id
- villa_id
- check_in
- check_out
- total_price
- status
- created_at

### Payments

- id
- booking_id
- amount
- payment_method
- status

### Deposits

- id
- user_id
- amount
- status

### Withdrawals

- id
- user_id
- amount
- bank_account
- status

### Reviews

- id
- user_id
- villa_id
- rating
- comment

### Notifications

- id
- user_id
- title
- message
- is_read

### AdminLogs

- id
- admin_id
- action
- created_at
