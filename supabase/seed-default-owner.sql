-- Script pour créer un utilisateur par défaut pour le développement
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer un profil par défaut pour les formulaires sans authentification
INSERT INTO public.profiles (id, email, full_name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'default@questionnaire-cari.app',
  'Utilisateur par défaut',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Vérifier que l'insertion a fonctionné
SELECT * FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001';

-- Utilisez cet UUID dans Vercel :
-- DEFAULT_OWNER_ID=00000000-0000-0000-0000-000000000001

