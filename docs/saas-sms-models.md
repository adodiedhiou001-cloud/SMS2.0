// Modèle de données pour le système SaaS SMS
// Ajout au schema Prisma

/*
// Ajouter ces modèles au schema.prisma

model SMSBundle {
  id          String   @id @default(cuid())
  name        String   // Ex: "Bundle 1000 SMS"
  totalSMS    Int      // Nombre total de SMS achetés
  usedSMS     Int      @default(0) // SMS utilisés
  remainingSMS Int     // SMS restants (calculé)
  purchaseDate DateTime @default(now())
  expiryDate  DateTime?
  cost        Float    // Coût du bundle
  provider    String   @default("Orange Sénégal")
  isActive    Boolean  @default(true)
  
  // Relations
  allocations SMSAllocation[]
  
  @@map("sms_bundles")
}

model SMSAllocation {
  id          String   @id @default(cuid())
  bundleId    String
  userId      String   // Client qui utilise ces SMS
  allocatedSMS Int     // SMS alloués à ce client
  usedSMS     Int      @default(0) // SMS utilisés par ce client
  remainingSMS Int     // SMS restants pour ce client
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  isActive    Boolean  @default(true)
  
  // Relations
  bundle      SMSBundle @relation(fields: [bundleId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
  
  @@map("sms_allocations")
}

model ClientSubscription {
  id            String   @id @default(cuid())
  userId        String   @unique
  planName      String   // Ex: "Starter", "Pro", "Enterprise"
  smsQuota      Int      // SMS inclus dans l'abonnement
  monthlyPrice  Float    // Prix mensuel
  startDate     DateTime @default(now())
  endDate       DateTime?
  isActive      Boolean  @default(true)
  autoRenew     Boolean  @default(true)
  
  // Relations
  user          User     @relation(fields: [userId], references: [id])
  
  @@map("client_subscriptions")
}

// Ajouter au modèle User existant :
// smsAllocation SMSAllocation?
// subscription  ClientSubscription?
*/
