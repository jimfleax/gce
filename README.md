# GCE - Cambridge International Examinations (GCE) Past Papers Downloader

## Overview

This command-line interface (CLI) tool simplifies and automates the process of downloading past papers for Cambridge International Examinations (GCE). The tool aims to provide students with an easier way to access past examination papers, supporting better preparation for upcoming assessments.

## Features

- **Simple Command-Line Interface**: Easy to use with simple commands.
- **Customizable Downloads**: Select specific subjects and years for download.
- **Batch Downloads**: Download multiple papers in one go.
- **Automatic File Organization**: Papers are automatically organized into folders by subject and year.
- **Documentation**: Includes user-friendly instructions to guide you through the setup and usage.

## Requirements

- NodeJS and NPM

## Installation

1. Clone the repository to your local machine.
   ```bash
   git clone https://github.com/jimfleax/gce.git
   cd gce
   ```

2. Install the required dependencies.
   ```bash
   npm install
   ```

## Usage

### Basic Command

To download past papers, use the following command:
```javascript
// the '...' here imply that parameter must be an array
gce [...SUBJECT] [...YEAR] [...COMPONENT CODE]
```

#### Arguments

- `SUBJECT`: The subject for which you want to download past papers (e.g., Math, Physics).
- `YEAR`: The year from which you want to download past papers (e.g., 2021, 2020).

### Example

To download Math past papers from 2021:
```javascript
gce ["Biology", "Physics", "Chemistry"] [2020,2021,2022,2023] [22,42,62] 
```

## File Structure

The downloaded papers will be organized in the following format:

```
GCE_Past_Papers/
├── Chemistry/
│   ├── 2019/
│   │   ├── Chemistry_qp_22.pdf
│   │   ├── Chemistry_qp_42.pdf
|   |   |__ Chemistry_qp_62.pdf
│   ├── 2020/
│   │   ├── Chemistry_qp_22.pdf
│   │   ├── Chemistry_qp_42.pdf
|   |   |__ Chemistry_qp_62.pdf
│   └── 2021/
│   │   ├── Chemistry_qp_22.pdf
│   │   ├── Chemistry_qp_42.pdf
|   |   |__ Chemistry_qp_62.pdf
└── Physics/
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

#### Made with ❤️ by [Jim Fleax](https://jimfleax.onrender.com)
