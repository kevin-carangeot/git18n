export const buildTranslationPrompt = (
	content: Record<string, unknown>,
	targetLangCode: string
) => {
	const languageName = new Intl.DisplayNames(['fr'], { type: 'language' }).of(targetLangCode)
	return `
    Contexte :
    - Tu traduis des fichiers JSON d'internationalisation (i18n).
    - La langue source est 'en.json'. Les clés sont strictement identiques dans toutes les langues : ne crée, ne renomme ni ne supprime aucune clé.
    - La langue cible est : ${languageName}.
    - Format de sortie : retourne uniquement du JSON valide, sans texte additionnel ni commentaires.
    Ton et style :
    - Reste fidèle au registre et au ton de la langue source ; n'impose aucun registre particulier.
    - Privilégie une traduction naturelle et idiomatique dans la langue cible plutôt qu'un calque mot à mot.
    - Boutons/CTA : formulation courte et directe, adaptée aux conventions UI de la langue cible.
    - Reste cohérent avec les valeurs déjà existantes dans la langue cible (terminologie, ponctuation, capitalisation, apostrophes, accents).
    Éléments à ne pas traduire :
    - Les placeholders {variable} et toute interpolation ({…}, %s, {{…}}, etc.) : conserve-les tels quels, sans en modifier le nom ni l'ordre.
    - Les balises et attributs HTML : ne traduis que le texte visible entre les balises.
    - Les noms propres, marques et identifiants techniques.
    - Les codes et unités (€, %, Mo/MB, etc.).
    Rappels techniques :
    - Ne touche pas aux clés ; ne modifie que les valeurs.
    - Conserve tous les placeholders {…} et le HTML intacts.
    - Si une valeur existe déjà dans la langue cible, harmonise-la mais ne la paraphrase pas inutilement.
    - Conserve la ponctuation, les espaces insécables éventuels, la casse et les unités telles quelles.
    - N'ajoute aucune phrase hors JSON (pas de pré/postambule).
    Plan d'action :
    1) Charger la valeur source (anglaise).
    2) Vérifier s'il existe déjà une valeur dans la langue cible ; l'harmoniser le cas échéant.
    3) Traduire de façon naturelle en respectant les règles ci-dessus.
    4) Relire pour : a) placeholders intacts, b) HTML intact, c) grammaire/accords corrects, d) aucune clé en double ou manquante.
    Checklist finale :
    - Toutes les clés de 'en.json' sont présentes dans la langue cible.
    - Placeholders et HTML intacts.
    - Aucune paraphrase superflue ; cohérence avec l'existant.
    - Format : JSON valide uniquement (aucun texte hors JSON), ponctuation/espaces/casse conformes à la langue cible.

    CONTENU À TRADUIRE (JSON) :
    ${JSON.stringify(content, null, 2)}
  `
}
