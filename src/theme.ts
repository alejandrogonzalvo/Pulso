export interface Theme {
  name: string;
  colors: {
    work: string;
    shortBreak: string;
    longBreak: string;
    paused: string;
    idle: string;
    text: {
      primary: string;
      secondary: string;
    };
    button: {
      primary: string;
      primaryText: string;
      secondary: string;
      secondaryText: string;
    };
  };
}

export const gruvboxTheme: Theme = {
  name: 'Gruvbox',
  colors: {
    work: '#7c2f1f',
    shortBreak: '#4a6b5a',
    longBreak: '#2d4a52',
    paused: '#3c3836',
    idle: '#504945',
    text: {
      primary: '#ebdbb2',
      secondary: '#ebdbb2',
    },
    button: {
      primary: '#ebdbb2',
      primaryText: '#282828',
      secondary: 'rgba(235, 219, 178, 0.2)',
      secondaryText: '#ebdbb2',
    },
  },
};

export const currentTheme: Theme = gruvboxTheme;

export function getBackgroundStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: color,
  };
}
