# wShift

A simple one-page web application for writing down your work shifts! wShift is designed to help you quickly document entries, with the help of shift templates: just simply fill out a model work shift, then reuse it for when you need to make a new shift entry!

Try it out: https://wshift.onrender.com

Demo video:

wShift uses Local Storage alongside Supabase, so guests can also use the calendar and all of it's functionalities. Logging in allows user to synchronize calendars across devices and you only need to provide an email address, since our authorization is magic-link-based.

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
