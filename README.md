# Sustainity Data Import API

## Introduction

Welcome to Sustainity's Backend Engineering challenge! This API enables the import, processing and management of data related to environmental sustainability. The system offers a complete solution for downloading CSV files, mapping their columns to predefined database fields, and accessing processed data via a RESTful interface.

## Fonctionnalités

- **Downloading CSV files** : Import your sustainability data securely
- **Intelligent column mapping** : Automatically associate CSV columns with database fields
- **Mapping suggestions** : Benefit from suggestions based on CSV header analysis
- **Asynchronous processing**: Manage large files with background processing
- **Complete RESTful API**: easy access to all functionalities via well-defined endpoints
- **Robust error management**: Precise identification and management of processing problems

## Tech Stack

- **Runtime** : Node.js
- **Framework** : Express.js
- **Database** : PostgreSQL
- **ORM** : Sequelize
- **CSV processing** : csv-parser
- **Queue** : Bull with Redis for asynchronous processing
- **Logger** : Custom configuration with Winston
- **File management** : Multer for downloading files

## Architecture

The API follows an MVC (Model-View-Controller) architecture with a clear separation of responsibilities:

- **Models** : Data representation (File, Record, Mapping)
- **Controllers** : Query and response management
- **Services** : Business logic for processing files, mappings and queues
- **Routes** : Definition of API endpoints
- **Middleware** : Download and error management

## API Endpoints

### File management

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/files` | List all downloaded files |
| GET | `/api/files/:id` | Retrieve a specific file |
| POST | `/api/files/upload` | Download a new CSV file |
| GET | `/api/files/preview/:id` | Preview the first 10 lines of a specific file |
| POST | `/api/files/process` | Starts file processing |
| GET | `/api/files/job/:jobId` | Checks the status of a processing job |

### Column Mapping

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/mappings` | Lists all existing mappings |
| GET | `/api/mappings/:id` | Retrieve a specific mapping |
| POST | `/api/mappings` | Create a new mapping |
| POST | `/api/mappings/bulk` | Create many mappings in one request |
| GET | `/api/mappings/suggestions/:fileId` | Generates mapping suggestions for a file |
| GET | `/api/mappings/fields/available` | Lists the fields available in the database |

### Data Access

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/data` | Recovers all processed data (with pagination) |
| GET | `/api/data/:id` | Retrieves a specific record |
| GET | `/api/data/file/:fileId` | Recovers all data from a specific file |

### System monitoring

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Checks the health of the service |
| GET | `/` | Root endpoint with basic information |

## Installation and Configuration

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- Redis (pour le traitement asynchrone)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/DeepLeau/sustainity.git
   cd sustainity
   ```

2. Installing dependencies
   ```bash
   npm install
   ```

3. Configuring environment variables
   ```bash
   cp .env.example .env
   ```
   Modify the `.env` file with your parameters:
   ```
   PORT=3000
   DB_NAME=sustainity
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. Start server
   ```bash
   npm start
   ```
   For development, use :
   ```bash
   npm run dev
   ```

## Utilisation

### Typical workflow

1. **Download a CSV file**
   ```bash
   curl -X POST -F "file=@/path/to/your/data.csv" http://localhost:3000/api/files/upload
   ```

2. **Preview the 10 first lines**
   ```bash
   curl http://localhost:3000/api/files/preview/1
   ```

3. **Get mapping suggestions**
   ```bash
   curl http://localhost:3000/api/mappings/suggestions/1
   ```

4. **Create mappings**
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{
     "mappings": [
       {
         "csv_column_name": "company_name",
         "db_field_name": "brand",
         "data_type": "string"
       },
       {
         "csv_column_name": "product_price",
         "db_field_name": "price",
         "data_type": "decimal"
       }
     ]
   }' http://localhost:3000/api/mappings/bulk
   ```

5. **Process the file**
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{
     "fileId": 1,
     "mappingIds": [1, 2],
     "useQueue": true
   }' http://localhost:3000/api/files/process
   ```

6. **Check treatment status**
   ```bash
   curl http://localhost:3000/api/files/job/1
   ```

7. **Accessing processed data**
   ```bash
   curl http://localhost:3000/api/data/file/1
   ```

## Project structure

```
sustainity-data-import/
├── config/
│   ├── database.js       # Sequelize Configuration
│   └── logger.js         # Winston Configuration 
├── controllers/
│   ├── dataController.js # Data management
│   ├── fileController.js # File management
│   └── mappingController.js # Mapping management
├── middleware/
│   ├── errorHandler.js   # Error management
│   └── uploadMiddleware.js # Multer configuration
├── models/
│   ├── File.js           # File template
│   ├── Mapping.js        # Mapping model
│   └── Record.js         # Recording model
├── routes/
│   ├── dataRoutes.js     # Data routes
│   ├── fileRoutes.js     # File routes
│   └── mappingRoutes.js  # Mapping routes
├── services/
│   ├── csvService.js     # CSV file processing
│   ├── mappingService.js # Mapping logic
│   └── queueService.js   # Queue management
├── utils/
│   ├── validators.js     # Datas validators
├── uploads/              # Folder for downloaded files
├── app.js                # Express application configuration
├── server.js             # Entry point
└── package.json          # Dependencies and scripts
```

## Caractéristiques Techniques

### Traitement des fichiers CSV

Le service utilise `csv-parser` pour traiter les fichiers CSV ligne par ligne, permettant de manipuler efficacement de grandes quantités de données sans consommer trop de mémoire.

### Conversion des types de données

Le système prend en charge la conversion des types de données suivants :
- `string` / `text` : Valeurs textuelles
- `integer` / `int` : Nombres entiers
- `decimal` / `float` / `number` : Nombres à virgule flottante
- `boolean` / `bool` : Valeurs booléennes (true/false)
- `date` : Dates formatées

### Traitement asynchrone

Pour les fichiers volumineux, le système utilise Bull avec Redis pour le traitement asynchrone :
- Mise en file d'attente des jobs
- Suivi de l'état des jobs
- Gestion des échecs et des erreurs

### Mappage intelligent

Le service offre des suggestions de mappage basées sur l'analyse des en-têtes CSV, utilisant :
- Correspondance exacte ou partielle des noms de colonnes
- Normalisation des noms pour une meilleure correspondance
- Liste prédéfinie de champs disponibles

## Contribuer

Nous accueillons les contributions ! Pour contribuer :

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
