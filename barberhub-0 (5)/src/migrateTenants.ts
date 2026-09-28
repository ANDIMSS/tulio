import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Tenant } from './types/tenant';

export async function runTenantMigration() {
  console.log('Starting tenant migration...');
  const tenantsRef = collection(db, 'tenants');
  const snapshot = await getDocs(tenantsRef);
  
  let migratedCount = 0;

  for (const tenantDoc of snapshot.docs) {
    const data = tenantDoc.data() as Partial<Tenant>;
    
    // Determine the new accessMode based on the current status
    let accessMode = data.accessMode;
    let needsUpdate = false;
    const updatePayload: any = {};
    
    if (!accessMode) {
      if (data.status === 'active') {
        accessMode = 'full';
      } else {
        accessMode = 'blocked';
      }
      updatePayload.accessMode = accessMode;
      needsUpdate = true;
    }

    if (data.masterMaintenanceEnabled === undefined) {
      updatePayload.masterMaintenanceEnabled = false;
      needsUpdate = true;
    }

    // Ensure license timestamps exist for strict rules evaluation
    if (data.licenseExpiresAt && !data.licenseExpiresAtTimestamp) {
      updatePayload.licenseExpiresAtTimestamp = Timestamp.fromDate(new Date(data.licenseExpiresAt));
      updatePayload.licenseExpiresAtMillis = new Date(data.licenseExpiresAt).getTime();
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        updatePayload.updatedAt = new Date().toISOString();
        await updateDoc(doc(db, 'tenants', tenantDoc.id), updatePayload);
        console.log(`Migrated tenant ${tenantDoc.id} (${data.name})`);
        migratedCount++;
      } catch (err) {
        console.error(`Error migrating tenant ${tenantDoc.id}:`, err);
      }
    }
  }

  console.log(`Migration complete. Migrated ${migratedCount} tenants.`);
}
