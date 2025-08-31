import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'sms-pro.db');
    
    // Créer le dossier data s'il n'existe pas
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await initializeTables();
  }
  
  return db;
}

async function initializeTables() {
  if (!db) return;

  // Table des utilisateurs
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
      organization_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
  `);

  // Table des organisations
  await db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      domain TEXT,
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des contacts
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      tags TEXT DEFAULT '[]',
      organization_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
  `);

  // Table des groupes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      organization_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
  `);

  // Table de liaison contacts-groupes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contact_groups (
      contact_id INTEGER,
      group_id INTEGER,
      PRIMARY KEY (contact_id, group_id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    )
  `);

  // Table des campagnes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
      scheduled_at DATETIME,
      sent_at DATETIME,
      recipient_count INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      organization_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Table des messages
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER,
      contact_id INTEGER,
      phone_number TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
      sent_at DATETIME,
      delivered_at DATETIME,
      error TEXT,
      organization_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
  `);

  // Table des modèles
  await db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      variables TEXT DEFAULT '[]',
      organization_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Table des clés API
  await db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      key TEXT UNIQUE NOT NULL,
      permissions TEXT DEFAULT '[]',
      organization_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      last_used DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Table d'audit
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      organization_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
  `);

  // Créer les index pour les performances
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number);
    CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_organization ON campaigns(organization_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
    CREATE INDEX IF NOT EXISTS idx_messages_campaign ON messages(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
  `);

  console.log('✅ Database tables initialized successfully');
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
