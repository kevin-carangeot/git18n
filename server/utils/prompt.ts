export const buildTranslationPrompt = (
	content: Record<string, unknown>,
	targetLangCode: string
) => {
	const languageName = new Intl.DisplayNames(['fr'], { type: 'language' }).of(targetLangCode)
	return `
    Contexte :
    - Tu traduis des fichiers JSON de i18n pour des contributeurs de modules/thèmes publiés sur la PrestaShop Marketplace.
    - La langue source est 'en.json'. Les clés sont identiques dans toutes les langues. Ne crée ni ne supprime de clé.
    - { product_type } = type de produit (email/module/thème/pack). Pour 'PRODUCT_SHEET.PRODUCT_NAME.TITLE', utilise les clés par type ('EMAIL', 'MODULE', 'THEME', 'PACK', 'DEFAULT') avec l’article correct (pas de placeholder dans les valeurs).
    - { productType } = type de produit utilisé dans les placeholders : passe le libellé localisé via 'PRODUCT_SHEET.PRODUCT_TYPE_LABEL' ('EMAIL', 'MODULE', 'THEME', 'PACK') et garde le placeholder. Email = « email template » / « template d’e-mail ».
    - Tu dois rester cohérent avec les valeurs déjà existantes dans la langue cible (ex : ponctuation, capitalisation, apostrophes, accents).
    - Format de sortie : retourne uniquement du JSON valide, sans texte additionnel ni commentaires.
    - Paramétrage recommandé côté appel : température = 0, top_p = 1.
    - La langue cible est : ${languageName}.
    Ton et style :
    - Toujours le vouvoiement.
    - Reste concis, clair, professionnel.
    - Boutons/CTA : formulation impérative simple (pas de “let’s”, “continuons”, “finissons”), ex. « Continuer », « Terminer », « Ajouter la langue sélectionnée » (et équivalents traduits).
    - Appliquer les meilleures recommandations UX : CTA explicites et courts, textes lisibles et accessibles (éviter jargon, formulations lourdes ou ambiguës).
    Marques et mots à conserver en anglais :
    - PrestaShop
    - PrestaShop Marketplace (ordre fixé : « PrestaShop » avant « Marketplace »)
    - Business Care
    - Developer guide / Terms of service : traduire l’intitulé dans la langue cible (ex. FR « Guide développeur », « Conditions d’utilisation ») en conservant le HTML et les placeholders {…}.
    - Ne traduis pas les placeholders {variable}, ni les balises HTML, ni les codes comme Mo/MB/MB, €, %, etc.
    Prépositions autour de « PrestaShop Marketplace » (adapter selon la grammaire naturelle) :
    - fr : sur la / de la PrestaShop Marketplace
    - es : en la / de la / del PrestaShop Marketplace
    - it : sulla / nella / dalla PrestaShop Marketplace
    - de : auf dem / vom PrestaShop Marketplace
    - nl : op de / van de PrestaShop Marketplace
    - pl : na / z PrestaShop Marketplace
    - pt : na / da PrestaShop Marketplace
    - ro : în / din PrestaShop Marketplace
    - ru : на / из PrestaShop Marketplace
    Mini-glossaire (exacts, à réutiliser sans paraphrase) :
    - FR : « sur la PrestaShop Marketplace », « de la PrestaShop Marketplace », « Guide développeur », « Conditions d’utilisation ».
    - ES : « en la PrestaShop Marketplace », « de la PrestaShop Marketplace », « Guía del desarrollador », « Términos del servicio ».
    - IT : « sulla PrestaShop Marketplace », « nella PrestaShop Marketplace », « Guida per sviluppatori », « Condizioni di servizio ».
    - DE : « auf dem PrestaShop Marketplace », « vom PrestaShop Marketplace », « Entwicklerhandbuch », « Nutzungsbedingungen ».
    - NL : « op de PrestaShop Marketplace », « van de PrestaShop Marketplace », « Handleiding voor ontwikkelaars », « Servicevoorwaarden ».
    - PL : « na PrestaShop Marketplace », « z PrestaShop Marketplace », « Przewodnik dewelopera », « Warunki świadczenia usługi ».
    - PT : « na PrestaShop Marketplace », « da PrestaShop Marketplace », « Guia do programador », « Termos de serviço ».
    - RO : « în PrestaShop Marketplace », « din PrestaShop Marketplace », « Ghidul dezvoltatorului », « Termenii serviciului ».
    - RU : « на PrestaShop Marketplace », « из PrestaShop Marketplace », « Руководство разработчика », « Условия обслуживания ».
    Rappels techniques :
    - Conserve tous les placeholders {…} et le HTML.
    - Respecte les mêmes guillemets et l’encodage ASCII.
    - Ne touche pas aux clés ; ne modifie que les valeurs.
    - Si une valeur existe déjà dans la langue cible, harmonise le ton mais ne paraphrase pas inutilement.
    - Pour les CTA, privilégie une commande directe (un mot ou deux) plutôt qu’une tournure inclusive.
    - Conserve la ponctuation, les espaces insécables éventuels, la casse et les unités telles quelles (Mo/MB/€).
    - N’ajoute aucune phrase hors JSON (pas de pré/postambule).
    Plan d’action :
    1) Charger la valeur anglaise (source).
    2) Vérifier s’il existe déjà une valeur dans la langue cible ; harmoniser le ton (vouvoiement) et les marques.
    3) Traduire en respectant les règles de marque et de préposition ci-dessus.
    4) Relire pour : a) placeholders intacts, b) HTML intact, c) accords/prepositions corrects, d) pas de doublons ou de clés manquantes.
    Checklist finale :
    - Toutes les clés de 'en.json' sont présentes dans la langue cible.
    - « PrestaShop Marketplace » avec la préposition/article corrects.
    - « Business Care » non traduit.
    - « Developer guide » et « Terms of service » traduits dans l’intitulé, HTML conservé.
    - Vouvoiement partout.
    - Placeholders et HTML intacts, ASCII, aucune paraphrase superflue.
    - Si possible, température = 0 côté outil d’appel pour limiter la variance entre modèles.
    - Format : JSON valide uniquement (aucun texte hors JSON), ponctuation/espaces/casse conformes à la langue cible.
    Exemple d’entrée/sortie (à donner au LLM pour fixer le style) :
    - EN source : '"PRODUCT_SHEET": { "LOGO": { "DESCRIPTION": "It will make it stand out and recognizable in the PrestaShop Marketplace." } }'
    - FR attendu : '"PRODUCT_SHEET": { "LOGO": { "DESCRIPTION": "Il le rendra visible et reconnaissable sur la PrestaShop Marketplace." } }'

    CONTENU À TRADUIRE (JSON) :
    ${JSON.stringify(content, null, 2)}
  `
}
