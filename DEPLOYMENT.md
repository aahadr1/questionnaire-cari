# Guide de déploiement Vercel

## 1. Configuration Supabase

### Créer l'utilisateur par défaut

Avant de déployer, exécutez ce script SQL dans l'éditeur SQL de Supabase :

```sql
-- Créer un profil par défaut pour les formulaires
INSERT INTO public.profiles (id, email, full_name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'default@questionnaire-cari.app',
  'Utilisateur par défaut',
  now()
)
ON CONFLICT (id) DO NOTHING;
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

# UUID de l'utilisateur par défaut créé ci-dessus
DEFAULT_OWNER_ID=00000000-0000-0000-0000-000000000001
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

### Test de création de formulaire

1. Allez sur votre site déployé
2. Cliquez sur "Créer un formulaire"
3. Ajoutez un titre et des questions
4. Cliquez sur "Créer"
5. Si vous voyez l'éditeur avec votre formulaire → ✅ Succès !

### Test de soumission publique

1. Créez un formulaire avec au moins une question
2. Cliquez sur "Publier"
3. Copiez le lien public
4. Ouvrez le lien dans un nouvel onglet incognito
5. Remplissez et envoyez le formulaire
6. Si vous voyez "Merci pour votre réponse !" → ✅ Succès !

## 5. Prochaines étapes (optionnel)

### Implémenter l'authentification utilisateur

Pour passer en production avec de vrais utilisateurs :

1. **Activer Supabase Auth** dans votre projet
2. **Implémenter** le login/signup dans l'app
3. **Mettre à jour** `app/api/forms/create/route.ts` pour utiliser `supabase.auth.getUser()`
4. **Retirer** la dépendance à `DEFAULT_OWNER_ID`

### Exemple de code avec auth :

```typescript
// app/api/forms/create/route.ts
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description, access_mode, questions } = await req.json()

  const { data, error } = await supabase
    .from('forms')
    .insert({
      title: title?.trim() || 'Sans titre',
      description: description || null,
      access_mode: access_mode || 'anonymous',
      owner_id: user.id, // ✅ Utiliser l'ID de l'utilisateur connecté
      team_id: null,
    })
    .select('id')
    .single()
  
  // ... reste du code
}
```

## Support

Si vous rencontrez des problèmes lors du déploiement, vérifiez :

- ✅ Toutes les variables d'environnement sont définies dans Vercel
- ✅ Le script SQL a été exécuté dans Supabase
- ✅ Les clés Supabase sont correctes (pas d'espaces, copie complète)
- ✅ La dernière version du code est bien déployée

