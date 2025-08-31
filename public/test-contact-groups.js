// Script de test pour l'API des groupes de contacts
// À exécuter dans la console du navigateur après s'être connecté

async function testContactGroupsAPI() {
  try {
    console.log('🧪 Test de l\'API des groupes de contacts...');
    
    // Récupérer le token d'authentification depuis les cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
    
    if (!token) {
      console.error('❌ Aucun token d\'authentification trouvé');
      console.log('💡 Veuillez vous connecter d\'abord');
      return;
    }
    
    console.log('🔑 Token trouvé, test de l\'API...');
    
    // Tester l'API des groupes
    const response = await fetch('/api/contacts/groups', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Réponse de l\'API:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Données reçues:', data);
    console.log(`📊 Nombre de groupes: ${data.length}`);
    
    data.forEach((group, index) => {
      console.log(`   ${index + 1}. ${group.name} (${group._count.contacts} contact${group._count.contacts > 1 ? 's' : ''})`);
    });
    
    return data;
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Exposer la fonction globalement pour utilisation en console
window.testContactGroupsAPI = testContactGroupsAPI;

console.log('📝 Fonction de test chargée. Utilisez testContactGroupsAPI() dans la console après vous être connecté.');
