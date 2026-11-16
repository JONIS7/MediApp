# MediApp — Sistema Integrado de Gestão Clínica

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)

Aplicação full-stack para gerenciamento de clínicas médicas, permitindo autenticação de profissionais, cadastro de médicos e pacientes, agendamento de consultas e emissão de prescrições médicas digitais com geração automática de receitas em **PDF** e upload de documentos assinados.

---

## Principais Funcionalidades

- **Autenticação JWT & Segurança**: Login de profissionais com senha criptografada (`bcrypt`) e rotas protegidas por token JWT (`authMiddleware`).
- **Dashboard Analítico**: Indicadores em tempo real de médicos, pacientes, consultas e prescrições, além de atalhos rápidos e resumo dos últimos atendimentos.
- **Gestão de Médicos (CRUD completo)**: Cadastro com CRM, especialidade, validação de telefone e e-mail, busca dinâmica, edição e exclusão.
- **Gestão de Pacientes (CRUD completo)**: Cadastro, listagem com busca e contagem de consultas vinculadas, edição e exclusão.
- **Agenda de Consultas**: Agendamento ligando médico e paciente com data/hora, filtros por status (*Agendadas* / *Realizadas*), remarcação e atalho direto para emissão de receita.
- **Prescrições Médicas & PDF**: Criação de receitas vinculadas às consultas, geração automática de arquivo PDF formatado com `PDFKit` (contendo dados da clínica, médico, paciente e posologia), upload de receitas assinadas via `Multer` e download autenticado.
- **Persistência Resiliente (Zero-Config Demo)**: Conecta-se a qualquer banco MongoDB (Atlas ou local) via `.env`, e possui fallback automático para persistência em JSON local (`src/database/local-db.json`) já populado com dados de demonstração quando nenhuma URI MongoDB está configurada.

---

## Arquitetura do Projeto

```text
MediApp/
├── src/                         # Backend API (Node.js + Express + Mongoose)
│   ├── config/env.js            # Carregamento seguro de variáveis de ambiente
│   ├── database/
│   │   ├── database.js          # Conexão MongoDB + fallback automático local
│   │   └── localStore.js        # Persistência local JSON com seed de demonstração
│   ├── middleware/              # Autenticação JWT (authMiddleware.js)
│   ├── models/                  # Schemas Mongoose (Doctor, Pacient, Appointment, Prescription)
│   ├── repositories/            # Camada de acesso a dados
│   ├── services/                # Regras de negócio e geração de PDF (PDFKit)
│   ├── routes/                  # Controllers REST e roteamento Express
│   ├── prescriptions/           # Armazenamento de PDFs gerados/enviados
│   └── .env.example             # Modelo de configuração da API
│
└── medi-app/                    # Frontend Web (Next.js 16 App Router + TypeScript + Tailwind)
    ├── app/
    │   ├── page.tsx             # Tela de Login com acesso rápido de demonstração
    │   ├── home/page.tsx        # Dashboard principal
    │   ├── doctor/              # Listagem, criação e edição de médicos
    │   ├── pacient/             # Listagem, criação e edição de pacientes
    │   ├── appointment/         # Agenda, agendamento e remarcação de consultas
    │   ├── prescription/        # Emissão, geração de PDF, upload e download de receitas
    │   ├── components/          # Layout autenticado com Sidebar responsiva
    │   └── lib/api.ts           # Cliente HTTP tipado, helpers de sessão e formatação
    └── .env.example             # Modelo de configuração do Frontend
```

---

## Como Executar Localmente

### Pré-requisitos
- **Node.js 20+** (testado com Node.js v22)
- **npm**
- *(Opcional)* Instância MongoDB local ou MongoDB Atlas

### 1. Configurar e iniciar o Backend (`src/`)

```bash
cd src
npm install
```

Crie o arquivo `.env` a partir do exemplo (ou use a configuração padrão sem `MONGODB_URI` para rodar com a base local pré-populada):

```bash
cp .env.example .env
```

Inicie a API (porta `3001`):

```bash
npm start
```

> **Modo Demonstração Automático:** Caso `MONGODB_URI` não esteja preenchido em `src/.env`, o servidor inicializa automaticamente o arquivo `src/database/local-db.json` com médicos, pacientes, consultas e prescrições de exemplo.

### 2. Configurar e iniciar o Frontend (`medi-app/`)

Em outro terminal:

```bash
cd medi-app
npm install
npm run dev
```

Acesse a aplicação em: **http://localhost:3000**

---

## Credenciais de Demonstração

Na tela de login, utilize o botão **"Preencher Demo"** ou informe:

- **Usuário:** `admin`
- **Senha:** `admin123`

---

## Principais Endpoints da API

| Recurso | Método | Rota | Autenticação |
| :--- | :--- | :--- | :---: |
| Healthcheck | `GET` | `/` | Não |
| Login | `POST` | `/login` | Não |
| Médicos | `GET` / `GET :id` / `POST /postDoctor` / `PUT :id` / `DELETE :id` | `/doctors` | JWT |
| Pacientes | `GET` / `GET :id` / `POST /postPacient` / `PUT :id` / `DELETE :id` | `/pacients` | JWT |
| Consultas | `GET` / `GET :id` / `POST` / `PUT :id` / `DELETE :id` | `/appointments` | JWT |
| Remarcar Consulta | `PUT` | `/reschedule/:id` | JWT |
| Prescrições | `GET` / `GET :id` / `POST /postPrescription` / `PUT :id` / `DELETE :id` | `/prescriptions` | JWT |
| Gerar Receita PDF | `GET` | `/generatePrescriptions/:id` | JWT |
| Upload Receita PDF | `POST` | `/uploadPrescription/:id` | JWT |
| Baixar Receita PDF | `GET` | `/readPrescription/:id` | JWT |
