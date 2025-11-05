# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

The Pulse team takes security seriously. If you've discovered a security vulnerability, please open a private security report with the following information:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if available)

Please include as much detail as possible. You should receive a response within 48 hours. If for some reason you don't get a response, you can follow up after a week.

## Security Considerations

### Local Processing

Pulse processes all media files locally using FFmpeg WebAssembly. No data is sent to external servers:

- Video/audio files remain on your machine
- Conversion happens in your browser/application context
- No telemetry or tracking of processed files
- No cloud uploads or storage

### File Permissions

Pulse requires file system access to:
- Read media files you select
- Cache converted files temporarily
- Store user settings and preferences

These operations are sandboxed and restricted to the application's designated directories.

### Content Security Policy

The application implements strict Content Security Policy (CSP) headers:

```
default-src 'self'
script-src 'self' https://cdn.jsdelivr.net
style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'
font-src https://cdnjs.cloudflare.com
connect-src 'self' https://cdn.jsdelivr.net
media-src 'self' blob:
```

### Electron Security Features

Pulse uses Electron with the following security configurations:

- **Context Isolation Enabled** - Renderer process is isolated from Node.js context
- **Sandbox Enabled** - Renderer process runs in a sandbox
- **Node Integration Disabled** - Node.js APIs not available in renderer
- **Preload Script** - Limited IPC bridge for necessary functionality
- **Web Security Enabled** - Standard web security restrictions enforced
- **No Remote Module** - Cannot dynamically load remote code

### Dependencies

Pulse minimizes external dependencies. Current dependencies:

- **@ffmpeg/ffmpeg** - WebAssembly FFmpeg library
- **@ffmpeg/util** - Utility functions for FFmpeg
- **electron** - Electron framework

All dependencies are:
- Regularly updated
- Scanned for vulnerabilities using npm audit
- Pinned to specific versions in package-lock.json
- Reviewed before updates

## Best Practices for Users

### Handling Media Files

- Only open media files from trusted sources
- Be cautious with files from unknown origins
- Malicious files could potentially exploit media codecs (though Pulse's sandboxing mitigates this)

### System Security

- Keep your operating system up to date
- Keep Node.js and npm updated
- Review file permissions for the application
- Disable modifications if you don't trust the source

## Vulnerability Scanning

We regularly scan dependencies for vulnerabilities using:

```bash
npm audit
```

To check for vulnerabilities yourself:

```bash
npm audit
```

To automatically fix vulnerabilities:

```bash
npm audit fix
```

## Security Updates

Security patches will be released as soon as practicable after a vulnerability is confirmed and fixed. Users will be notified through:

- GitHub Releases
- Security advisories
- Email notifications for registered users (if applicable)

## Known Security Limitations

### Codec Vulnerabilities

While Pulse uses FFmpeg's widely-tested codecs, codec implementations may contain vulnerabilities. Pulse's sandboxing provides defense-in-depth, but users should:

- Keep their system updated
- Report codec-related issues to FFmpeg project
- Consider the source of media files

### Preload Script Exposure

The preload script exposes limited IPC functionality. Review `src/main/preload.js` to understand what APIs are available to the renderer.

### Third-Party Libraries

Icon library (Font Awesome) is loaded from CDN. While Font Awesome is reputable:

- Network requests could theoretically be intercepted
- Use HTTPS to mitigate man-in-the-middle attacks
- Consider offline deployments for high-security environments

## Security Headers

When Electron DevTools are open in development, ensure you're not exposing sensitive data through:

- Console logs
- Network requests
- Local storage inspection

## Responsible Disclosure

We appreciate coordinated vulnerability disclosure and ask that researchers:

1. Report vulnerabilities responsibly
2. Give us time to patch before public disclosure
3. Avoid accessing systems beyond the scope necessary to confirm the vulnerability
4. Avoid disruption to users
5. Do not modify or access user data

We will:

1. Acknowledge receipt of your report within 48 hours
2. Provide a timeline for a fix
3. Release a patch and security advisory
4. Credit the researcher (if desired)

Thank you for helping keep Pulse secure!