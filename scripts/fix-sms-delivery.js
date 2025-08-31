const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🔧 Diagnostic et correction des SMS...\n');

const dbPath = path.join('prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

// Analyser les problèmes détaillés
console.log('📊 ANALYSE DÉTAILLÉE DES PROBLÈMES:');
console.log('=====================================');

// 1. Messages avec phoneNumber null
db.all("SELECT campaignId, COUNT(*) as count FROM messages WHERE phoneNumber IS NULL GROUP BY campaignId", [], (err, nullPhones) => {
  if (err) {
    console.error('❌ Erreur:', err);
    return;
  }
  
  console.log('\n🔍 Messages sans numéro de téléphone:');
  nullPhones.forEach(item => {
    console.log(`   Campagne ${item.campaignId}: ${item.count} messages`);
  });
  
  // 2. Messages pending qui devraient être envoyés
  db.all("SELECT campaignId, COUNT(*) as count FROM messages WHERE status = 'pending' GROUP BY campaignId", [], (err, pendingMsgs) => {
    if (err) {
      console.error('❌ Erreur:', err);
      return;
    }
    
    console.log('\n⏳ Messages en attente:');
    pendingMsgs.forEach(item => {
      console.log(`   Campagne ${item.campaignId}: ${item.count} messages`);
    });
    
    // 3. Analyser les contacts disponibles
    db.all("SELECT COUNT(*) as count FROM contacts", [], (err, contactCount) => {
      if (err) {
        console.error('❌ Erreur contacts:', err);
        return;
      }
      
      console.log(`\n👥 Contacts disponibles: ${contactCount[0].count}`);
      
      if (contactCount[0].count > 0) {
        // Montrer quelques contacts
        db.all("SELECT firstName, lastName, phone FROM contacts LIMIT 5", [], (err, contacts) => {
          if (err) {
            console.error('❌ Erreur contacts détails:', err);
            return;
          }
          
          console.log('\n👤 Exemples de contacts:');
          contacts.forEach((contact, i) => {
            console.log(`   ${i+1}. ${contact.firstName} ${contact.lastName}: ${contact.phone}`);
          });
          
          // 4. Vérifier les campagnes problématiques
          db.all("SELECT id, name, status, createdAt FROM campaigns WHERE id IN (SELECT DISTINCT campaignId FROM messages WHERE phoneNumber IS NULL)", [], (err, campaigns) => {
            if (err) {
              console.error('❌ Erreur campagnes:', err);
              return;
            }
            
            console.log('\n📋 Campagnes avec problèmes:');
            campaigns.forEach(campaign => {
              console.log(`   - ${campaign.name} (${campaign.status})`);
              console.log(`     ID: ${campaign.id}`);
              console.log(`     Créée: ${campaign.createdAt}`);
            });
            
            console.log('\n🎯 SOLUTIONS RECOMMANDÉES:');
            console.log('=====================================');
            console.log('1. ❌ Lier les messages aux contacts (phoneNumber manquant)');
            console.log('2. ❌ Relancer les messages pending');
            console.log('3. ❌ Vérifier le planificateur de campagnes');
            console.log('4. ❌ Corriger l\'association contacts-messages');
            
            // Proposer une correction
            console.log('\n🔧 CORRECTION AUTOMATIQUE:');
            console.log('=====================================');
            
            // Corriger les phoneNumber manquants en liant avec les contacts
            db.run(`
              UPDATE messages 
              SET phoneNumber = (
                SELECT contacts.phone 
                FROM contacts 
                WHERE contacts.id = messages.contactId
              ) 
              WHERE phoneNumber IS NULL 
              AND contactId IS NOT NULL
            `, [], function(err) {
              if (err) {
                console.error('❌ Erreur correction phoneNumber:', err);
              } else {
                console.log(`✅ ${this.changes} numéros de téléphone corrigés`);
                
                // Vérification après correction
                db.get("SELECT COUNT(*) as remaining FROM messages WHERE phoneNumber IS NULL", [], (err, remaining) => {
                  if (err) {
                    console.error('❌ Erreur vérification:', err);
                  } else {
                    console.log(`📊 Messages sans numéro restants: ${remaining.remaining}`);
                    
                    if (remaining.remaining === 0) {
                      console.log('\n🎉 TOUS LES NUMÉROS ONT ÉTÉ CORRIGÉS !');
                      console.log('💡 Maintenant les messages peuvent être envoyés correctement');
                      
                      // Relancer les messages pending avec phoneNumber valide
                      console.log('\n🚀 Relance des messages pending...');
                      
                      db.run(`
                        UPDATE messages 
                        SET status = 'ready_to_send' 
                        WHERE status = 'pending' 
                        AND phoneNumber IS NOT NULL
                      `, [], function(err) {
                        if (err) {
                          console.error('❌ Erreur relance:', err);
                        } else {
                          console.log(`✅ ${this.changes} messages marqués prêts à envoyer`);
                          console.log('\n✨ CORRECTION TERMINÉE !');
                          console.log('📱 Les SMS peuvent maintenant être envoyés correctement');
                          console.log('🔄 Redémarrez l\'application pour voir les changements');
                        }
                        db.close();
                      });
                    } else {
                      console.log(`⚠️ Il reste ${remaining.remaining} messages sans numéro`);
                      console.log('💡 Ces messages sont probablement orphelins (pas de contact associé)');
                      db.close();
                    }
                  }
                });
              }
            });
          });
        });
      } else {
        console.log('⚠️ Aucun contact dans la base de données !');
        console.log('💡 Il faut d\'abord ajouter des contacts pour envoyer des SMS');
        db.close();
      }
    });
  });
});
