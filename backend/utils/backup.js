const fs = require('fs');
const path = require('path');

// NOTE: This is a MongoDB (Mongoose) backup that writes JSON snapshots to disk.
// Restore clears target collections and inserts documents from the snapshot.

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const MAX_BACKUPS = 10; // Keep only last 10 backups
const MAX_BACKUP_SIZE_MB = 500; // Max size per backup

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

const getBackupPathById = (backupId) => {
  ensureBackupDir();
  return path.join(BACKUP_DIR, `${backupId}.json`);
};

const safeBackupId = (id) => {
  // keep it simple and safe for filesystem
  return String(id).replace(/[^a-zA-Z0-9._-]/g, '');
};

const listBackupsOnDisk = () => {
  ensureBackupDir();
  const files = fs.readdirSync(BACKUP_DIR);

  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const id = f.replace(/\.json$/, '');
      const full = path.join(BACKUP_DIR, f);
      const stat = fs.statSync(full);
      return {
        id,
        createdAt: stat.mtime.toISOString(),
        size: stat.size,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const createBackupSnapshot = async ({ collections }) => {
  const startedAt = new Date();

  const snapshot = {
    version: 1,
    createdAt: startedAt.toISOString(),
    collections: {},
  };

  for (const [collectionName, model] of Object.entries(collections)) {
    // Use lean() to avoid mongoose overhead
    // Preserve _id by explicitly requesting plain objects.
    const docs = await model.find({}).lean();
    snapshot.collections[collectionName] = docs;
  }

  return snapshot;
};

const writeBackupToDisk = ({ backupId, snapshot }) => {
  ensureBackupDir();
  const backupPath = getBackupPathById(backupId);
  fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2), 'utf8');
  return backupPath;
};

const restoreBackupSnapshot = async ({ snapshot, collections }) => {
  // Restore strategy:
  // - deleteMany({}) for each collection
  // - insertMany(snapshot.collections[collectionName])

  for (const [collectionName, model] of Object.entries(collections)) {
    const docs = snapshot?.collections?.[collectionName] || [];

    await model.deleteMany({});

    if (docs.length > 0) {
      // insertMany preserves provided _id values.
      // If duplicates happen, Mongoose will throw; we cleared first.
      await model.insertMany(docs, { ordered: true });
    }
  }
};

const readBackupFromDisk = ({ backupId }) => {
  const id = safeBackupId(backupId);
  const backupPath = getBackupPathById(id);
  if (!fs.existsSync(backupPath)) {
    return null;
  }
  const raw = fs.readFileSync(backupPath, 'utf8');
  return JSON.parse(raw);
};

// Auto-cleanup old backups (keep only MAX_BACKUPS)
const cleanupOldBackups = () => {
  try {
    ensureBackupDir();
    const backups = listBackupsOnDisk();
    
    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      toDelete.forEach(backup => {
        const backupPath = getBackupPathById(backup.id);
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
          console.log(`Deleted old backup: ${backup.id}`);
        }
      });
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
};

// Get backup statistics
const getBackupStats = () => {
  try {
    ensureBackupDir();
    const backups = listBackupsOnDisk();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    
    return {
      totalBackups: backups.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      oldestBackup: backups[backups.length - 1],
      newestBackup: backups[0],
      maxBackups: MAX_BACKUPS
    };
  } catch (err) {
    console.error('Stats error:', err);
    return null;
  }
};

module.exports = {
  BACKUP_DIR,
  listBackupsOnDisk,
  getBackupPathById,
  createBackupSnapshot,
  writeBackupToDisk,
  restoreBackupSnapshot,
  readBackupFromDisk,
  safeBackupId,
  cleanupOldBackups,
  getBackupStats,
  MAX_BACKUPS,
  MAX_BACKUP_SIZE_MB,
};
