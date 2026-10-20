# NeuroSense

**Explainable Multimodal AI Framework for Parkinsonian Disorder
Screening**

NeuroSense යනු motor, voice සහ handwriting assessment outputs එකතු කර
Fusion component එකකින් screening output ලබාදීමට සැලසුම් කරන group research
project එකකි.

> **Current status:** Backend FastAPI starter services සහ Docker Compose
> configuration සකස් කර ඇත. `/health` endpoints සේවාව ආරම්භ වනවාද පරීක්ෂා
> කිරීමට පමණි. Trained-model inference, fusion logic, Grad-CAM සහ mobile
> app එක සම්පූර්ණ බව මෙයින් අදහස් නොවේ.

## 1. Architecture

``` text
Mobile Application
  ├── Motor API       http://localhost:8001
  ├── Voice API       http://localhost:8002
  ├── Handwriting API http://localhost:8003
  └── Fusion API      http://localhost:8004
```

-   **Motor API:** motor/sensor assessment inference.
-   **Voice API:** voice model inference.
-   **Handwriting API:** spiral සහ meander handwriting images වලින්
    handwriting score ලබාදීම.
-   **Fusion API:** motor, voice සහ handwriting scores එකතු කර final
    screening output සකස් කිරීම.
-   **Mobile app:** assessment flow සහ results පෙන්වීම. Framework එක තවම
    තීරණය කර නැත.

මෙය research/screening prototype එකකි; medical diagnosis එකක් වෙනුවට භාවිතා
නොකළ යුතුය.

## 2. Repository structure

``` text
NeuroSense/
├── apps/mobile/
│   ├── src/screens/
│   ├── src/components/
│   ├── src/services/
│   ├── src/types/
│   └── README.md
├── services/
│   ├── motor-api/
│   │   ├── app/{api,schemas,services,core}/
│   │   ├── app/main.py
│   │   ├── models/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── voice-api/          # same FastAPI structure
│   ├── handwriting-api/
│   │   ├── app/{api,schemas,services,core}/
│   │   ├── app/preprocessing/
│   │   ├── app/explainability/
│   │   ├── app/main.py
│   │   ├── models/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── fusion-api/          # same FastAPI structure
├── shared/
│   ├── contracts/
│   ├── schemas/
│   └── types/
├── device-firmware/
├── docs/{architecture,api}/
├── scripts/
├── tests/integration/
├── docker-compose.neurosense.yml
├── .env.example
├── .gitignore
└── README.md
```

Actual repository එකේ files ටිකක් වෙනස් විය හැක. `.gitkeep` පමණක් තිබෙන
folders තවම implementation එකක් නොමැති placeholders විය හැක.

## 3. Folder responsibilities

  ---------------------------------------------------------------------------
  Folder/file                             Purpose
  --------------------------------------- -----------------------------------
  `apps/mobile/src/screens/`              App screens: upload, assessment,
                                          result.

  `apps/mobile/src/components/`           Reusable UI components.

  `apps/mobile/src/services/`             Backend API clients.

  `apps/mobile/src/types/`                Mobile language/framework types.

  `services/*-api/app/main.py`            FastAPI app entry point.

  `app/api/`                              HTTP endpoints/routes.

  `app/schemas/`                          Pydantic request/response
                                          validation.

  `app/services/`                         Business logic and model inference
                                          orchestration.

  `app/core/`                             Settings, logging and
                                          configuration.

  `models/`                               Trained model artifacts.

  `handwriting-api/app/preprocessing/`    Image decode, resize, normalization
                                          and input preparation.

  `handwriting-api/app/explainability/`   Grad-CAM/heatmap logic, once
                                          implemented.

  `requirements.txt`                      Python dependencies for that
                                          service.

  `Dockerfile`                            Instructions to build that service
                                          image.

  `docker-compose.neurosense.yml`         Build/run all APIs and map host
                                          ports.

  `shared/contracts/`                     Agreements between APIs.

  `shared/schemas/`, `shared/types/`      Shared data structures/types.

  `device-firmware/`                      Embedded firmware if required by
                                          the motor hardware.

  `docs/architecture/`, `docs/api/`       Architecture and API documentation.

  `scripts/`                              Reusable development scripts.

  `tests/integration/`                    Tests across multiple APIs.
  ---------------------------------------------------------------------------

## 4. Requirements

### Backend

-   Docker Desktop installed and **running**.
-   Docker CLI and Docker Compose available.
-   Git for repository operations.

Docker Compose භාවිතා කරන විට backend Python packages Windows host එකට
වෙනම install කිරීම සාමාන්‍යයෙන් අවශ්‍ය නැත. Docker build එකේදී service එකේ
`requirements.txt` packages container image එක තුළ install වේ.

### Mobile

Mobile framework එක තවම තීරණය කර නැත. React Native + Expo තෝරාගත්තොත්
Node.js/npm tooling පසුව අවශ්‍ය වේ. ඒවා backend containers run කිරීමට අවශ්‍ය
නැත.

## 5. Windows PowerShell: run the backend

### Step 1 --- Start Docker Desktop

Start Menu එකෙන් Docker Desktop open කර engine එක fully started වෙනතුරු
ඉන්න. සාමාන්‍යයෙන් මෙම project එකට Linux containers mode භාවිතා කරන්න.

### Step 2 --- Go to repository root and verify Docker

``` powershell
cd path\to\NeuroSense
docker --version
docker compose version
docker info
```

`docker --version` CLI එක තිබෙන බව පෙන්වයි. `docker info` daemon/engine එකට
සම්බන්ධ විය හැකි බව verify කිරීමට උදව් කරයි.

### Step 3 --- Validate Compose configuration

``` powershell
docker compose -f docker-compose.neurosense.yml config
```

Error එකක් ලැබුණොත් YAML indentation, Dockerfile paths සහ Compose
configuration පරීක්ෂා කරන්න.

### Step 4 --- Build and start all services

``` powershell
docker compose -f docker-compose.neurosense.yml up --build -d
```

`--build` images build/rebuild කරයි; `-d` background mode එකෙන් run කරයි.
පළමු build එකට internet access සහ package/image downloads අවශ්‍ය විය හැක.

### Step 5 --- Check containers and logs

``` powershell
docker compose -f docker-compose.neurosense.yml ps
docker compose -f docker-compose.neurosense.yml logs
docker compose -f docker-compose.neurosense.yml config --services
```

එක් service එකක logs බැලීමට, Compose service name එක `handwriting-api` නම්:

``` powershell
docker compose -f docker-compose.neurosense.yml logs handwriting-api
```

Service name එක YAML file එකෙන් තහවුරු කරන්න.

### Step 6 --- Test health endpoints

  ---------------------------------------------------------------------------------------
  API                     Health                           Swagger docs
  ----------------------- -------------------------------- ------------------------------
  Motor                   `http://localhost:8001/health`   `http://localhost:8001/docs`

  Voice                   `http://localhost:8002/health`   `http://localhost:8002/docs`

  Handwriting             `http://localhost:8003/health`   `http://localhost:8003/docs`

  Fusion                  `http://localhost:8004/health`   `http://localhost:8004/docs`
  ---------------------------------------------------------------------------------------

PowerShell:

``` powershell
Invoke-RestMethod http://localhost:8001/health
Invoke-RestMethod http://localhost:8002/health
Invoke-RestMethod http://localhost:8003/health
Invoke-RestMethod http://localhost:8004/health
```

Expected response එකේ `status` එක `ok` සහ service name එක නිවැරදි විය යුතුය.
Starter code එක `inference_ready: false` ලබාදෙන්නේ නම් model inference තවම
සූදානම් නැත. Health check එකෙන් model loading හෝ prediction quality තහවුරු
නොවේ.

## 6. Ports

  Component       Host port   Container port Base URL
  ------------- ----------- ---------------- -------------------------
  Motor                8001             8000 `http://localhost:8001`
  Voice                8002             8000 `http://localhost:8002`
  Handwriting          8003             8000 `http://localhost:8003`
  Fusion               8004             8000 `http://localhost:8004`

මෙම port mapping එක `docker-compose.neurosense.yml` තුළ තිබෙන values සමඟ
verify කරන්න. Container එක ඇතුළේ APIs හතරම port 8000 භාවිතා කළ හැක; Windows
host එකෙන් වෙන වෙනම ports හරහා access කරයි.

## 7. Useful commands

``` powershell
# Restart
docker compose -f docker-compose.neurosense.yml restart

# Rebuild after code/dependency changes
docker compose -f docker-compose.neurosense.yml up --build -d

# Stop containers, keeping named volumes
docker compose -f docker-compose.neurosense.yml down

# Show all containers
docker ps
```

`docker compose down -v` භාවිතා කිරීමට පෙර volumes මකා දැමීම අවශ්‍යද තහවුරු
කරන්න. පසුව database volume එකක් තිබුණොත් `-v` data මකා දැමිය හැක.

## 8. Implementation roadmap

### Phase 1 --- Baseline

-   [ ] Docker engine running බව තහවුරු කරන්න.
-   [ ] Compose config validate කරන්න.
-   [ ] APIs හතර build/run කරන්න.
-   [ ] Health endpoints හතර පරීක්ෂා කරන්න.
-   [ ] README/architecture changes review කර commit කරන්න.

### Phase 2 --- API contracts

-   [ ] Request/response schemas එකඟ කරගන්න.
-   [ ] Image/audio/sensor payload formats සහ limits තීරණය කරන්න.
-   [ ] Score range සහ meaning එක define කරන්න.
-   [ ] Error response format එක එකඟ කර `shared/contracts/` සහ
    `docs/api/` update කරන්න.

### Phase 3 --- Handwriting inference

-   [ ] Model file extension, framework, architecture සහ loading method
    හඳුනාගන්න.
-   [ ] Training-time image size, channels, normalization, preprocessing
    සහ input order තහවුරු කරන්න.
-   [ ] Spiral/meander input schema සහ preprocessing implement කරන්න.
-   [ ] Model loading/inference service එක implement කරන්න.
-   [ ] Known test images, invalid files සහ edge cases සඳහා tests ලියන්න.
-   [ ] Grad-CAM model architecture එකට support නම් පමණක් implement කරන්න.
-   [ ] Output score එක calibrated probability ද raw score ද පැහැදිලිව
    document කරන්න.

**Model format එක unknown නිසා TensorFlow/Keras හෝ PyTorch packages අන්ධ
ලෙස add නොකරන්න.** `.keras`, `.h5`, `.pt`, `.pth` extension එක පමණක්
inference code තීරණය කිරීමට ප්‍රමාණවත් නොවිය හැක; training code සහ exact
input/output contract එකත් අවශ්‍යය.

### Phase 4 --- Motor and Voice

-   [ ] Model files සහ inference requirements component owners ගෙන්
    ලබාගන්න.
-   [ ] Framework/dependencies තහවුරු කරන්න.
-   [ ] Preprocessing, inference service සහ tests implement කරන්න.
-   [ ] Model artifacts Docker image එකට copy/mount කරන ආකාරය verify
    කරන්න.

### Phase 5 --- Fusion

-   [ ] Motor/voice/handwriting score contract එක define කරන්න.
-   [ ] Missing score සහ failed component cases හසුරුවන්න.
-   [ ] Fusion model input order, scaling සහ output labels document
    කරන්න.
-   [ ] Fusion inference සහ integration tests implement කරන්න.

### Phase 6 --- Mobile and end-to-end

-   [ ] Mobile framework එක තෝරන්න.
-   [ ] Upload/assessment/result screens implement කරන්න.
-   [ ] API clients implement කර services connect කරන්න.
-   [ ] Emulator/physical-device network access test කරන්න.
-   [ ] Validation, errors, consent/privacy සහ usability test කරන්න.

## 9. Troubleshooting

### `docker` is not recognized

Docker Desktop install/PATH පරීක්ෂා කර PowerShell එක close කර නැවත open
කරන්න. ඉන්පසු `docker --version` run කරන්න.

### Cannot connect to Docker daemon

Docker Desktop fully started ද බලන්න. Docker Desktop status/backend error
messages පරීක්ෂා කර අවශ්‍ය නම් restart කරන්න.

### `docker compose` not found

Docker Desktop installation/update එක පරීක්ෂා කර `docker compose version`
run කරන්න. Docker Desktop සාමාන්‍යයෙන් Compose ඇතුළත් කරයි.

### Port already in use

PowerShell:

``` powershell
netstat -ano | findstr :8003
```

වෙන application එකක් port එක භාවිතා කරනවා නම් Compose file එකේ host-side
port එක වෙනස් කර නව URL එකෙන් test කරන්න.

### Build fails on Python package installation

``` powershell
docker compose -f docker-compose.neurosense.yml logs
docker compose -f docker-compose.neurosense.yml build --no-cache handwriting-api
```

`requirements.txt` versions, package compatibility, internet/DNS සහ
error message එකේ package name පරීක්ෂා කරන්න.

### Container exits immediately

``` powershell
docker compose -f docker-compose.neurosense.yml ps -a
docker compose -f docker-compose.neurosense.yml logs handwriting-api
```

Python import errors, missing files, wrong Uvicorn target සහ dependency
errors පරීක්ෂා කරන්න.

### Health works but prediction does not

Starter API එකේ `/health` පමණක් තිබේ නම් prediction route එක තවම implement
කළ යුතුය. `/docs` හි registered routes පමණක් පෙන්වයි. Health success එකෙන්
model inference හෝ clinical validity තහවුරු නොවේ.

### Model file missing in container

Model file path, Dockerfile `COPY`/volume configuration සහ
`.dockerignore`/`.gitignore` exclusions පරීක්ෂා කරන්න. Large/private model
artifacts commit කිරීමට පෙර team policy සහ repository limits බලන්න.

### Git conflict

`git status` සහ `git diff` බලලා conflict එක review කරන්න. Existing files
overwrite කිරීමට පෙර changes review කරගන්න.

## 10. Git workflow

``` powershell
git status
git branch
git add README.md
git commit -m "docs: add NeuroSense setup and development guide"
git push origin dev
```

Repository root එකේ සිටින බවත් `dev` branch එකේ බවත් verify කරන්න.
`git add README.md` මඟින් README එක පමණක් stage වේ.

## 11. Development and privacy rules

-   Passwords, API keys සහ real secrets Git එකට commit නොකරන්න.
-   `.env.example` තුළ placeholders පමණක් තබා actual `.env` file එක
    `.gitignore` තුළ ඇති බව verify කරන්න.
-   Patient-identifiable data අනවශ්‍ය ලෙස logs වලට ලියන්න එපා.
-   Dataset/model license සහ data privacy restrictions පිළිපදින්න.
-   Research screening score එක clinical diagnosis ලෙස present නොකරන්න.
-   එක් එක් component owner විසින් model version, preprocessing, API contract
    සහ tests document කළ යුතුය.

## 12. Current limitations

-   APIs දැනට starter health endpoints පමණක් සපයන බව සැලකිය යුතුය.
-   Model inference endpoints implement කර ඇති බව තවම තහවුරු කර නැත.
-   Handwriting model format සහ inference contract එක unknown.
-   Fusion logic සහ mobile app integration තවම pending.
-   මෙම starter setup එකෙන් clinical validation හෝ diagnostic accuracy
    එකක් අදහස් නොවේ.

## 13. Official references

-   [Docker Desktop on
    Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
-   [Docker Compose installation
    overview](https://docs.docker.com/compose/install/)
-   [FastAPI in
    Containers](https://fastapi.tiangolo.com/deployment/docker/)

**Maintainers:** NeuroSense research group\
**Primary branch:** `dev`\
**Status:** Initial backend scaffolding / integration in progress
