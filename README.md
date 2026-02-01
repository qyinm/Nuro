# Dual N-Back

A minimal, black-and-white Chrome extension for cognitive training with the Dual N-Back task.

## What is Dual N-Back?

Dual N-Back is a cognitive training exercise that challenges your working memory. You must remember both **positions** (where a square appeared) and **audio** (what letter you heard) from N trials ago.

## Features

- **3x3 Grid Game** - Visual position stimulus
- **Audio Letters** - Spoken letters via Web Speech API (C, H, K, L, Q, R, S, T)
- **N-Back Levels 1-6** - From beginner to expert difficulty
- **Adaptive Difficulty** - Auto-adjusts based on your performance
- **Comprehensive Stats** - Track accuracy, streaks, trends over time
- **Session Recovery** - Resume interrupted sessions within 5 minutes
- **Daily Reminders** - Optional notifications to maintain your training habit
- **Minimal Design** - Clean black & white aesthetic

## Controls

| Key | Action |
|-----|--------|
| `A` | Position match (same position as N trials ago) |
| `F` | Audio match (same letter as N trials ago) |
| `Space` | Start / Pause game |
| `Esc` | Quit to menu |

## How Scoring Works

For each trial after the warm-up period:

- **Hit** - Correctly pressing when there's a match
- **Miss** - Not pressing when there was a match
- **False Alarm** - Pressing when there's no match
- **Correct Rejection** - Correctly not pressing when there's no match

Accuracy = (Hits + Correct Rejections) / Total Trials

## Adaptive Difficulty

When adaptive mode is enabled:

- **Level Up** - Combined accuracy ≥80% AND both position & audio ≥75%
- **Level Down** - Combined accuracy <50% OR either type <40%
- **Stay Same** - All other cases

## Development

```bash
# Install dependencies
pnpm install

# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Create zip for distribution
pnpm zip
```

## Tech Stack

- **WXT** - Next-gen extension framework
- **Vue 3** - Composition API
- **Pinia** - State management
- **TypeScript** - Type safety

## Project Structure

```
├── components/
│   ├── game/          # Game UI components
│   ├── stats/         # Statistics components
│   ├── settings/      # Settings panel
│   ├── onboarding/    # Tutorial
│   └── ui/            # Shared UI components
├── src/
│   ├── composables/   # Vue composables
│   ├── stores/        # Pinia stores
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
└── entrypoints/
    ├── popup/         # Extension popup
    └── background.ts  # Service worker
```

## License

MIT
