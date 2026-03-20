# wShift

## Notes I wrote down for this small project

react router, tailwind, supabase, vercel
loaders & actions
Calendar: monthly, yearly view
Weekly: hover to view insights of certain week beside calendar
Click on day: shows shifts and option to add shift
CRUD shift templates (count breaks?)
Overviews with theoretical pay
Pay limit warning for a month (aushilfe)
Optimistic UI with confirmation toast
Offline/online mode: option to always stay offline, sync button, always sync, cache site, local storage
Login/signup: change email/password, delete account
Desktop view: overview and insights on left, calendar middle/right
Mobile view: navbar for calendar and insights separately
Neobrutalistic UI

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```
