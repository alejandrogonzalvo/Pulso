# Pulso 

A modern, lightweight pomodoro timer application built with Tauri, React, and TypeScript. Features a floating video player for YouTube music, achievements system, and comprehensive statistics tracking.

## Prerequisites

### Linux

1. **Rust** - Install from https://rustup.rs/
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Node.js** - Version 20.19+ recommended
   ```bash
   # Using nvm
   nvm install 20
   ```

3. **System Dependencies** (Ubuntu/Debian)
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

4. **mpv** (for media player feature)
   ```bash
   sudo apt install mpv
   ```

5. **yt-dlp** (for YouTube support)
   ```bash
   sudo apt install yt-dlp
   # Or via pip
   pip install yt-dlp
   ```

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd pulso-pomodoro
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run in development mode
   ```bash
   npm run tauri:dev
   ```

4. Build for production
   ```bash
   npm run tauri:build
   ```

The built application will be in `src-tauri/target/release/`.

## Usage

### Default Settings

- Work Duration: 25 minutes
- Short Break: 5 minutes
- Long Break: 15 minutes
- Pomodoros until Long Break: 4

### Achievements

Unlock achievements by:
- Completing sessions
- Maintaining streaks
- Accumulating focus hours

## Roadmap

- [ ] Settings UI for customizing durations
- [ ] mpv floating window integration
- [ ] YouTube playlist support
- [ ] Statistics dashboard
- [ ] Achievement notifications
- [ ] Sound customization
- [ ] Dark/Light theme toggle
- [ ] Desktop notifications
- [ ] Export statistics
- [ ] AppImage/Flatpak packaging

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Inspired by the Pomodoro Technique® by Francesco Cirillo
