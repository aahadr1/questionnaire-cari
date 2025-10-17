# Guide de déploiement Vercel

## 1. Configuration Supabase

### Activer l'authentification Email

1. Allez sur [supabase.com](https://supabase.com) et ouvrez votre projet
2. Allez dans **Authentication** → **Providers**
3. Activez **Email** provider
4. Configurez les paramètres d'email (ou utilisez la configuration par défaut)
5. **Important** : Désactivez "Confirm email" si vous voulez tester rapidement (ou configurez un service d'email)

### Activer RLS (Row Level Security)

Les politiques RLS sont déjà définies dans `supabase/rls.sql`. Assurez-vous qu'elles sont appliquées :

```sql
-- Exécuter dans l'éditeur SQL de Supabase si ce n'est pas déjà fait
-- Les scripts dans supabase/schema.sql et supabase/rls.sql
```

## 2. Variables d'environnement Vercel

Dans les paramètres de votre projet Vercel, ajoutez ces variables d'environnement :

### Variables obligatoires

```bash
# URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co

# Clé publique anon de Supabase (Project Settings > API > anon/public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici

# Clé service role de Supabase (Project Settings > API > service_role)
# ⚠️ ATTENTION : Cette clé contourne RLS, gardez-la secrète !
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

### Comment trouver vos clés Supabase ?

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Project Settings** (icône engrenage) > **API**
4. Copiez :
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Déploiement

Une fois les variables configurées dans Vercel :

1. **Redéployer** le projet depuis l'interface Vercel
2. **Vérifier** que le build passe sans erreur
3. **Tester** l'application déployée

## 4. Test post-déploiement

### Test d'inscription et connexion

1. Allez sur votre site déployé
2. Cliquez sur "Créer un compte"
3. Remplissez le formulaire (nom, email, mot de passe)
4. Si l'email de confirmation est activé, vérifiez votre boîte mail
5. Connectez-vous avec vos identifiants

### Test de création de formulaire

1. Une fois connecté, cliquez sur "Créer un formulaire"
2. Ajoutez un titre et des questions
3. Cliquez sur "Créer"
4. Si vous voyez l'éditeur avec votre formulaire → ✅ Succès !

### Test de soumission publique

1. Créez un formulaire avec au moins une question
2. Cliquez sur "Publier"
3. Copiez le lien public
4. **Ouvrez le lien dans un nouvel onglet incognito** (important : pas besoin de connexion !)
5. Pour un formulaire **nominatif** :
   - Page 1 : Entrez votre nom et email → Cliquez "Commencer le formulaire"
   - Page 2 : Répondez aux questions → Cliquez "Envoyer mes réponses"
6. Pour un formulaire **anonyme** :
   - Répondez directement aux questions → Cliquez "Envoyer mes réponses"
7. Si vous voyez "Merci pour votre réponse !" → ✅ Succès !

## 5. Architecture d'authentification

### Pour les créateurs de formulaires (obligatoire)

- ✅ Authentification requise pour créer des formulaires
- ✅ Authentification requise pour éditer des formulaires
- ✅ Authentification requise pour voir les réponses
- ✅ Chaque utilisateur ne voit que ses propres formulaires

### Pour les répondants (aucune auth)

- ✅ Aucune authentification requise pour répondre aux formulaires publics
- ✅ Les formulaires nominatifs demandent nom + email (optionnel)
- ✅ Les formulaires anonymes ne demandent aucune information personnelle

## 6. Fonctionnalités implémentées

### Authentification
- [x] Inscription avec email/password
- [x] Connexion
- [x] Déconnexion
- [x] Protection des routes privées
- [x] Menu utilisateur avec profil

### Gestion des formulaires
- [x] Création de formulaires (auth requise)
- [x] Édition avec auto-save
- [x] 7 types de questions (texte court/long, choix unique/multiple, nombre, date, fichier)
- [x] Drag & drop pour réorganiser
- [x] Preview en temps réel
- [x] Publication avec slug unique

### Soumission publique
- [x] Flow 2 étapes pour formulaires nominatifs
- [x] Validation des réponses
- [x] Page de confirmation
- [x] Support de tous les types de questions

### Analyse des réponses
- [x] Tableau des réponses
- [x] Pagination
- [x] Export CSV
- [x] Filtrage par propriétaire

## 7. Sécurité

- ✅ RLS activé sur toutes les tables
- ✅ Vérification de propriété sur toutes les opérations
- ✅ Service role key uniquement côté serveur
- ✅ Validation Zod côté client et serveur
- ✅ Protection CSRF (Next.js)

## Support

Si vous rencontrez des problèmes lors du déploiement, vérifiez :

- ✅ Toutes les variables d'environnement sont définies dans Vercel
- ✅ L'authentification Email est activée dans Supabase
- ✅ Les politiques RLS sont appliquées
- ✅ Les clés Supabase sont correctes (pas d'espaces, copie complète)
- ✅ La dernière version du code est bien déployée

## Notes importantes

⚠️ **Pas besoin de DEFAULT_OWNER_ID** : Le système d'authentification est maintenant complet. Chaque formulaire est automatiquement attribué à l'utilisateur connecté.

⚠️ **Désactiver la confirmation d'email en dev** : Pour tester rapidement, désactivez "Confirm email" dans Supabase Auth Settings.

⚠️ **Les formulaires publics ne nécessitent JAMAIS d'authentification** : C'est le comportement attendu et implémenté.
