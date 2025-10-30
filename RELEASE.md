# Release Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases.

## How It Works

When you push commits to the `main` branch, the CI workflow automatically:

1. Analyzes commit messages to determine the version bump (major, minor, patch)
2. Updates version numbers in all files (package.json, Cargo.toml, tauri.conf.json)
3. Generates a CHANGELOG.md with release notes
4. Builds the Tauri application for all platforms (Linux, Windows, macOS)
5. Creates a GitHub release with the built binaries
6. Commits the version changes back to the repository

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages:

- `feat:` - New features (triggers minor version bump)
- `fix:` - Bug fixes (triggers patch version bump)
- `perf:` - Performance improvements (triggers patch version bump)
- `BREAKING CHANGE:` - Breaking changes (triggers major version bump)
- `docs:`, `chore:`, `style:`, `refactor:`, `test:` - No release

### Examples

```bash
# Patch release (1.0.0 -> 1.0.1)
git commit -m "fix: correct timer display bug"

# Minor release (1.0.0 -> 1.1.0)
git commit -m "feat: add dark mode support"

# Major release (1.0.0 -> 2.0.0)
git commit -m "feat: redesign settings page

BREAKING CHANGE: settings API has changed"
```

## Manual Release

To trigger a release locally (for testing):

```bash
npm run release
```

**Note:** Make sure you have a `GITHUB_TOKEN` environment variable set with appropriate permissions.

## Configuration Files

- [.releaserc.json](.releaserc.json) - semantic-release configuration
- [.github/workflows/release.yml](.github/workflows/release.yml) - GitHub Actions workflow
- [scripts/sync-version.js](scripts/sync-version.js) - Version synchronization script

## First Release

To create your first release, simply push a commit with a `feat:` or `fix:` prefix to the main branch:

```bash
git add .
git commit -m "feat: initial release"
git push origin main
```

The CI will automatically create version 1.0.0 and publish the release.