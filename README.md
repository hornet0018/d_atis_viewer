# D-ATIS Viewer

A modern web application for viewing Airport Terminal Information Service (ATIS) data, built with React Router and deployed on Cloudflare Pages.

## Features

- 🚀 ATIS data display for major Japanese airports
- 📊 Real-time METAR and TAF information
- 🎨 Modern dark UI with TailwindCSS
- 📱 Responsive design
- ⚡️ SPA mode for static hosting
- 🔒 TypeScript by default

## Supported Airports

| Code | Airport |
| --- | --- |
| RJTT | Tokyo Haneda |
| RJAA | Tokyo Narita |
| RJBB | Osaka Kansai |
| RJSS | Sendai |
| RJOO | Osaka Itami |
| RJFF | Fukuoka |
| RJFK | Kagoshima |

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

The static files will be generated in `build/client/`.

## Deployment

### Cloudflare Pages Deployment

#### Option 1: Direct Deploy with Wrangler

Deploy directly to Cloudflare Pages:

```bash
npm run pages:deploy
```

This will:
1. Build the application
2. Deploy `build/client/` to Cloudflare Pages

#### Option 2: Manual Deploy via Git

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Cloudflare Pages
3. Set build configuration:
   - **Build command**: `npm run build`
   - **Build output directory**: `build/client`
4. Deploy!

#### Option 3: Manual Upload

```bash
# Build the app
npm run build

# Deploy using wrangler
npx wrangler pages deploy build/client
```

### Cloudflare Pages Configuration

The project includes `wrangler.toml` for Cloudflare Pages configuration:

```toml
name = "d-atis-viewer"
compatibility_date = "2024-01-01"
pages_build_output_dir = "build/client"
```

## API

This application uses the [D-ATIS API](https://github.com/hornet0018/d_atis_api) deployed at:

```
https://d-atis-api.kenta-722-768.workers.dev/
```

## Tech Stack

- **Framework**: React Router v7
- **Styling**: TailwindCSS v4
- **TypeScript**: Enabled
- **Hosting**: Cloudflare Pages
- **API**: Cloudflare Workers

## License

MIT

---

Built with ❤️ using React Router.
