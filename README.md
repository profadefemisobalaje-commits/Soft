# PDF Security Remover

Privacy-focused, mobile-friendly browser PDF password removal. Valid authorization and a PDF password are required for encrypted files.

This website processes PDFs locally using MuPDF WebAssembly. No file is sent to a backend. Certificate-encrypted PDFs and DRM are not supported. Saving a PDF may invalidate existing digital signatures.

## Deployment

This repository contains a Vite React app and a GitHub Pages workflow. Enable **Settings → Pages → Build and deployment → Source: GitHub Actions** to publish.

## Development

`npm install` then `npm run dev`.

MuPDF is AGPL-licensed (or commercially licensed). Review the license obligations before distributing or operating the application.
