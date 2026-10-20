# NeuroSense# NeuroSense

> **Explainable Multimodal AI Framework for Early Screening of
> Parkinsonian Disorders**

NeuroSense is a final-year research project that combines **Handwriting
Assessment**, **Voice Assessment**, **Motor Assessment**, and a **Fusion
AI Model** into a single mobile application for Parkinsonian disorder
screening.

> **Research Prototype:** This system is intended for research and
> screening purposes. It is **not** a medical diagnosis tool.

------------------------------------------------------------------------

# System Overview

``` text
                     NeuroSense Mobile App
                           (React Native)

          ┌───────────────┬───────────────┬───────────────┐
          │               │               │               │
          ▼               ▼               ▼               ▼
   Handwriting API   Voice API      Motor API      Fusion API
     (FastAPI)        (FastAPI)      (FastAPI)      (FastAPI)
          │               │               │
          └───────────────┴───────────────┘
                          │
                    Fusion AI Model
                          │
                          ▼
          Final Parkinsonian Screening Result
```

The mobile application acts as the single entry point for all
assessments, while each AI component runs as an independent backend
service.

------------------------------------------------------------------------

# Repository Structure

``` text
NeuroSense/
│
├── apps/
│   └── mobile/
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   ├── services/
│       │   ├── navigation/
│       │   ├── hooks/
│       │   ├── utils/
│       │   └── types/
│       ├── assets/
│       ├── app.json
│       ├── package.json
│       └── README.md
│
├── services/
│   ├── handwriting-api/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   ├── preprocessing/
│   │   │   ├── explainability/
│   │   │   ├── core/
│   │   │   └── main.py
│   │   ├── models/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── voice-api/
│   ├── motor-api/
│   └── fusion-api/
│
├── shared/
│   ├── contracts/
│   ├── schemas/
│   └── types/
│
├── device-firmware/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── research/
│   └── diagrams/
│
├── scripts/
├── tests/
│   ├── unit/
│   └── integration/
│
├── docker-compose.neurosense.yml
├── .env.example
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

# Project Components

  -----------------------------------------------------------------------
  Component                    Responsibility
  ---------------------------- ------------------------------------------
  **Mobile App**               User interface, image capture, audio
                               recording, motor assessment flow, result
                               display

  **Handwriting API**          Spiral and Meander image processing, CNN
                               inference, heatmap generation

  **Voice API**                Audio preprocessing and voice model
                               inference

  **Motor API**                Sensor/motor assessment processing

  **Fusion API**               Combines all component scores into the
                               final screening output
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Folder Responsibilities

## apps/mobile

The single mobile application used by patients and clinicians.

### Planned Screens

-   Splash Screen
-   Home Screen
-   Handwriting Assessment
-   Voice Assessment
-   Motor Assessment
-   Assessment Progress
-   Results Screen

### Purpose of Important Folders

  Folder         Purpose
  -------------- --------------------------
  `screens`      App screens
  `components`   Reusable UI components
  `services`     API calls
  `navigation`   Navigation configuration
  `hooks`        Custom React hooks
  `utils`        Helper functions
  `types`        Shared TypeScript types

------------------------------------------------------------------------

## services/

Each AI component has its own independent FastAPI backend.

### Handwriting API

This is the image-based Parkinson's assessment component.

Responsibilities:

-   Receive Spiral image
-   Receive Meander image
-   Image preprocessing
-   Load trained model
-   Generate handwriting score
-   Generate Grad-CAM heatmap
-   Return JSON response

### Voice API

Responsibilities:

-   Receive audio
-   Extract voice features
-   Run trained model
-   Return voice score

### Motor API

Responsibilities:

-   Receive motor assessment data
-   Process movement features
-   Run trained model
-   Return motor score

### Fusion API

Responsibilities:

-   Receive component scores
-   Run Fusion AI model
-   Generate final screening output

------------------------------------------------------------------------

# Docker Architecture

Each backend runs inside its own Docker container.

  Service           Port
  ----------------- ------
  Motor API         8001
  Voice API         8002
  Handwriting API   8003
  Fusion API        8004

------------------------------------------------------------------------

# Technology Stack

  Layer              Technology
  ------------------ ----------------------
  Mobile             React Native + Expo
  Backend            Python FastAPI
  AI                 TensorFlow / PyTorch
  Containerization   Docker
  Version Control    Git + GitHub

------------------------------------------------------------------------

# Running the Project

## Prerequisites

Install:

-   Docker Desktop
-   Git
-   Node.js (for the mobile app)
-   VS Code

------------------------------------------------------------------------

## Verify Docker

``` powershell
docker --version
docker compose version
docker info
```

------------------------------------------------------------------------

## Start Backend Services

From the repository root:

``` powershell
docker compose -f docker-compose.neurosense.yml up --build -d
```

Check running containers:

``` powershell
docker compose -f docker-compose.neurosense.yml ps
```

View logs:

``` powershell
docker compose -f docker-compose.neurosense.yml logs
```

Stop all services:

``` powershell
docker compose -f docker-compose.neurosense.yml down
```

------------------------------------------------------------------------

## API Endpoints

  Service       Health                    Swagger
  ------------- ------------------------- -----------------------
  Motor         `localhost:8001/health`   `localhost:8001/docs`
  Voice         `localhost:8002/health`   `localhost:8002/docs`
  Handwriting   `localhost:8003/health`   `localhost:8003/docs`
  Fusion        `localhost:8004/health`   `localhost:8004/docs`

------------------------------------------------------------------------

# Development Workflow

## Git Flow

Main development branch:

``` text
dev
```

Typical workflow:

``` powershell
git pull origin dev
git checkout dev
git checkout -b feature/your-feature
git add .
git commit -m "Implement feature"
git push origin feature/your-feature
```

After review:

-   Create Pull Request
-   Merge into `dev`

------------------------------------------------------------------------

# Implementation Roadmap

## Phase 1

-   [x] Repository setup
-   [x] Folder structure
-   [x] Docker architecture
-   [ ] Mobile initialization

## Phase 2

-   [ ] Handwriting API implementation
-   [ ] Voice API implementation
-   [ ] Motor API implementation

## Phase 3

-   [ ] Fusion API implementation
-   [ ] API integration

## Phase 4

-   [ ] Mobile integration
-   [ ] End-to-end testing

## Phase 5

-   [ ] Performance evaluation
-   [ ] Research validation

------------------------------------------------------------------------

# Handwriting Component Pipeline

``` text
Spiral Image
      │
      ▼
Preprocessing
      │
      ▼
Trained CNN Model
      │
      ▼
PD Score (0–1)
      │
      ▼
Grad-CAM Heatmap
      │
      ▼
Mobile App
```

------------------------------------------------------------------------

# Future Enhancements

-   Authentication
-   Patient history
-   Cloud deployment
-   Offline inference
-   Model version management
-   Audit logging
-   Secure API authentication

------------------------------------------------------------------------

# Troubleshooting

## Docker Desktop not running

Start Docker Desktop before running:

``` powershell
docker compose up
```

## Port already in use

``` powershell
netstat -ano | findstr :8003
```

## Check running containers

``` powershell
docker ps
```

## View logs

``` powershell
docker compose logs handwriting-api
```

------------------------------------------------------------------------

# Security Notes

-   Never commit `.env`.
-   Never commit patient data.
-   Keep trained models version-controlled according to team policy.
-   Validate all API inputs.

------------------------------------------------------------------------

# Team Architecture

  Member     Component
  ---------- ------------------------
  Member 1   Handwriting Assessment
  Member 2   Voice Assessment
  Member 3   Motor Assessment
  Member 4   Fusion AI Model

All components are integrated into a single mobile application through
independent backend services.

------------------------------------------------------------------------

# License

Research project -- NeuroSense Team.
