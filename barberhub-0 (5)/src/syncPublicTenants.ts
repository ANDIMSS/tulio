import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

export async function syncPublicTenants() {
  console.log('Syncing public tenants...');
  const tenantsRef = collection(db, 'tenants');
  const snapshot = await getDocs(tenantsRef);
  
  for (const tenantDoc of snapshot.docs) {
    const data = tenantDoc.data();
    const publicRef = doc(db, 'publicTenants', tenantDoc.id);
    await setDoc(publicRef, {
      name: data.name || '',
      tradeName: data.tradeName || '',
      slug: data.slug || '',
      status: data.status || 'active',
      accessMode: data.accessMode || 'full',
      customDomain: data.customDomain || ''
    }, { merge: true });
  }
  console.log('Public tenants synced.');
}
