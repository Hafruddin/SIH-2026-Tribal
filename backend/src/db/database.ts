import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../tribal_scholar.db');
const db = new Database(dbPath);

// Enable foreign keys & WAL mode for speed
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      mobile TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
      otr_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      otr_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      pincode TEXT NOT NULL,
      address TEXT NOT NULL,
      category TEXT NOT NULL,
      st_certificate_no TEXT,
      pvtg_status INTEGER DEFAULT 0,
      pvtg_group_name TEXT,
      annual_income REAL NOT NULL,
      father_name TEXT,
      mother_name TEXT,
      academic_level TEXT NOT NULL,
      current_course TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      institution_code TEXT,
      disability_status INTEGER DEFAULT 0,
      bank_account_no TEXT NOT NULL,
      ifsc_code TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      aadhaar_masked TEXT NOT NULL,
      profile_completed INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scholarships (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_hi TEXT NOT NULL,
      name_te TEXT NOT NULL,
      name_ta TEXT NOT NULL,
      name_mr TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      name_kn TEXT NOT NULL,
      academic_level TEXT NOT NULL,
      income_limit REAL NOT NULL,
      st_only INTEGER DEFAULT 1,
      pvtg_priority INTEGER DEFAULT 1,
      deadline TEXT NOT NULL,
      max_amount REAL NOT NULL,
      description_en TEXT NOT NULL,
      description_hi TEXT NOT NULL,
      benefits TEXT NOT NULL,
      required_docs TEXT NOT NULL,
      guidelines TEXT NOT NULL,
      faq_json TEXT NOT NULL,
      status TEXT DEFAULT 'OPEN'
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      application_no TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL,
      scholarship_id TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      current_status TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deficiency_remarks TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (scholarship_id) REFERENCES scholarships(id)
    );

    CREATE TABLE IF NOT EXISTS application_timeline (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      status TEXT NOT NULL,
      action_by TEXT NOT NULL,
      remarks TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      doc_name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER DEFAULT 102400,
      verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
      verified_by TEXT DEFAULT 'Unified System Verification Engine',
      digilocker_imported INTEGER DEFAULT 0,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS application_documents (
      application_id TEXT NOT NULL,
      document_id TEXT NOT NULL,
      PRIMARY KEY (application_id, document_id),
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      amount REAL NOT NULL,
      sanction_no TEXT NOT NULL,
      status TEXT NOT NULL,
      utr_no TEXT NOT NULL,
      disbursed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      bank_status TEXT DEFAULT 'Success (DBT Account Credited)',
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS grievances (
      id TEXT PRIMARY KEY,
      ticket_no TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL,
      category TEXT NOT NULL,
      scholarship_id TEXT,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Submitted',
      assigned_to TEXT DEFAULT 'MoTA Helpdesk Cell',
      resolution TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_hi TEXT NOT NULL,
      category TEXT NOT NULL,
      publish_date TEXT NOT NULL,
      download_url TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_hi TEXT NOT NULL,
      message_en TEXT NOT NULL,
      message_hi TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export default db;
