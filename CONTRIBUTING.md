# Contributing to Pulse

First off, thank you for considering contributing to Pulse! It's people like you that make Pulse such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem** in as many details as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible
- **Include your environment details**: OS, Node version, Electron version, etc.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and explain the expected behavior
- **Explain why this enhancement would be useful**
- **List some other applications where this enhancement exists**, if applicable

### Pull Requests

- Fill in the required template
- Follow the TypeScript styleguides
- End all files with a newline
- Avoid platform-dependent code

## Development Process

### Setting Up Your Development Environment

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/Paryx-games/Pulse.git
   cd Pulse
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/your-username/Pulse.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly:
   ```bash
   npm run dev
   ```
3. Ensure your code follows the project's style guidelines
4. Make sure you haven't introduced any linting errors:
   ```bash
   npm run lint
   ```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Your commit messages should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process, dependencies, or tooling

**Examples:**
```
feat: add accent color customization to UI

fix: resolve memory leak in video playback

docs: update README with keyboard shortcuts

refactor: simplify FFmpeg worker initialization
```

### Submitting Changes

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the main repository's `main` branch
3. Describe your changes and why you're making them
4. Reference any related issues using `#issue-number`
5. Wait for code review and feedback

## Styleguides

### JavaScript/HTML/CSS Style

- Use meaningful variable and function names
- Comment complex logic but avoid obvious comments
- Keep functions small and focused
- Use const by default, let when needed, avoid var

## Recognition

Contributors will be recognized in the project's [README.md](README.md) Thank you for your contributions!